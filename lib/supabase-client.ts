const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const authBase = `${url}/auth/v1`;
const restBase = `${url}/rest/v1`;

type Session = { access_token: string; refresh_token: string; user: { id: string; email: string } };

const getSessionLocal = (): Session | null => {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('sb_session');
  return raw ? JSON.parse(raw) : null;
};
const setSessionLocal = (session: Session | null) => {
  if (typeof window === 'undefined') return;
  if (!session) localStorage.removeItem('sb_session');
  else localStorage.setItem('sb_session', JSON.stringify(session));
};

async function authRequest(path: string, body: any) {
  const res = await fetch(`${authBase}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: anon },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  return { ok: res.ok, data, error: res.ok ? null : { message: data.msg || data.error_description || 'Auth failed' } };
}

class QueryBuilder {
  private filters: string[] = [];
  private _order?: string;
  constructor(private table: string) {}
  eq(column: string, value: string | number | boolean) { this.filters.push(`${column}=eq.${encodeURIComponent(String(value))}`); return this; }
  order(column: string, opts?: { ascending?: boolean }) { this._order = `${column}.${opts?.ascending === false ? 'desc' : 'asc'}`; return this; }
  async select(columns = '*') {
    const q = [`select=${encodeURIComponent(columns)}`, ...this.filters];
    if (this._order) q.push(`order=${this._order}`);
    return restRequest(this.table, 'GET', undefined, q.join('&'));
  }
  async single() { const r = await this.select('*'); return { ...r, data: Array.isArray(r.data) ? r.data[0] : r.data }; }
  async insert(payload: any) { return restRequest(this.table, 'POST', payload); }
  async upsert(payload: any) { return restRequest(this.table, 'POST', payload, '', { Prefer: 'resolution=merge-duplicates' }); }
  async update(payload: any) { return restRequest(this.table, 'PATCH', payload, this.filters.join('&')); }
  async delete() { return restRequest(this.table, 'DELETE', undefined, this.filters.join('&')); }
}

async function restRequest(table: string, method: string, body?: any, query = '', extraHeaders: Record<string, string> = {}) {
  const session = getSessionLocal();
  const headers: Record<string, string> = { apikey: anon, Authorization: `Bearer ${session?.access_token ?? anon}`, 'Content-Type': 'application/json', ...extraHeaders };
  const res = await fetch(`${restBase}/${table}${query ? `?${query}` : ''}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const data = res.status === 204 ? null : await res.json();
  return { data, error: res.ok ? null : { message: data?.message || 'Request failed' } };
}

export const supabase = {
  auth: {
    async signUp({ email, password }: { email: string; password: string }) {
      const r = await authRequest('/signup', { email, password });
      if (r.ok && r.data?.access_token) setSessionLocal(r.data as Session);
      return { error: r.error };
    },
    async signInWithPassword({ email, password }: { email: string; password: string }) {
      const r = await authRequest('/token?grant_type=password', { email, password });
      if (r.ok) setSessionLocal(r.data as Session);
      return { error: r.error };
    },
    async resetPasswordForEmail(email: string, { redirectTo }: { redirectTo: string }) {
      const r = await authRequest('/recover', { email, redirect_to: redirectTo });
      return { error: r.error };
    },
    async getSession() { return { data: { session: getSessionLocal() } }; },
    async signOut() { setSessionLocal(null); return { error: null }; }
  },
  from(table: string) { return new QueryBuilder(table); }
};
