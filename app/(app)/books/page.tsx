'use client';
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase-client';
import { differenceInDays, getYear } from 'date-fns';
import { localDateISO } from '@/lib/utils';

export default function BooksPage() {
  const [books, setBooks] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [pages, setPages] = useState(250);
  const today = localDateISO();

  const load = async () => {
    const { data } = await supabase.from('books').order('created_at', { ascending: false }).select('*,book_logs(*)');
    setBooks(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const completedThisYear = useMemo(() => books.filter((b) => b.completed_on && getYear(new Date(b.completed_on)) === getYear(new Date())).length, [books]);

  return <div className='card'><h1>Books Tracker</h1>
    <div className='item'><input className='input' placeholder='Book title' value={title} onChange={(e) => setTitle(e.target.value)} /><input className='input' type='number' value={pages} onChange={(e) => setPages(Number(e.target.value))} /><button className='btn' onClick={async () => { await supabase.from('books').insert({ title, total_pages: pages, status: 'active', started_on: today }); setTitle(''); load(); }}>Add</button></div>
    <p>Books completed this year: {completedThisYear}</p>
    <div className='list'>{books.length === 0 && <div className='empty'>📚 No books yet.</div>}
      {books.map((b) => {
        const read = (b.book_logs ?? []).reduce((a: number, l: any) => a + l.pages_read, 0);
        const pct = Math.round((read / b.total_pages) * 100);
        const daysToComplete = b.completed_on ? differenceInDays(new Date(b.completed_on), new Date(b.started_on)) : null;
        return <div key={b.id} className='item'><span>{b.title} · {pct}% · {b.status} {daysToComplete !== null ? `· ${daysToComplete} days` : ''}</span>
          <div style={{ display: 'flex', gap: '.5rem' }}>
            <button className='btn' onClick={async () => { await supabase.from('book_logs').insert({ book_id: b.id, pages_read: 10, logged_on: today }); load(); }}>+10 pages</button>
            <button className='btn' onClick={async () => { await supabase.from('books').eq('id', b.id).update({ status: 'paused' }); load(); }}>Pause</button>
            <button className='btn' onClick={async () => { await supabase.from('books').eq('id', b.id).update({ status: 'completed', completed_on: today }); load(); }}>Complete</button>
          </div>
        </div>;
      })}</div>
  </div>;
}
