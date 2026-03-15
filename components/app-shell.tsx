'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Menu } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';
import { supabase } from '@/lib/supabase-client';
import { cn } from '@/lib/utils';

const nav = [
  ['Dashboard', '/dashboard'],
  ['Habits', '/habits'],
  ['Tasks', '/tasks'],
  ['Nutrition', '/nutrition'],
  ['Books', '/books']
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const router = useRouter();

  return <div className='app-shell'>
    <aside className={cn('sidebar', open && 'open')}>
      <h2>Productivity</h2>
      <nav className='list'>
        {nav.map(([label, href]) => <Link key={href} href={href} onClick={() => setOpen(false)} className={cn('item', path === href && 'active')}>{label}</Link>)}
      </nav>
    </aside>
    <main className='content'>
      <header className='header'>
        <button className='btn' onClick={() => setOpen((v) => !v)}><Menu size={18} /></button>
        <div style={{ display: 'flex', gap: '.5rem' }}>
          <ThemeToggle />
          <button className='btn' onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }}>Logout</button>
        </div>
      </header>
      {children}
    </main>
  </div>;
}
