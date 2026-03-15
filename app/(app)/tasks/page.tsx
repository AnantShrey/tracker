'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase-client';
import { localDateISO } from '@/lib/utils';

export default function TasksPage() {
  const [title, setTitle] = useState('');
  const [tasks, setTasks] = useState<any[]>([]);
  const today = localDateISO();
  const load = async () => {
    const { data } = await supabase.from('tasks').order('due_date', { ascending: true }).select('*');
    setTasks(data ?? []);
  };
  useEffect(() => { load(); }, []);

  return <div className='card'><h1>Tasks</h1>
    <div className='item'><input className='input' value={title} onChange={(e) => setTitle(e.target.value)} placeholder='Add daily task' />
      <button className='btn' onClick={async () => { if (!title.trim()) return; await supabase.from('tasks').insert({ title, due_date: today }); setTitle(''); load(); }}>Add</button></div>
    <div className='list' style={{ marginTop: '1rem' }}>
      {tasks.length === 0 && <div className='empty'>📝 No tasks yet.</div>}
      {tasks.map((t) => <div className='item' key={t.id}><span>{t.title} {t.due_date < today && !t.completed ? '⏰ overdue' : ''}</span>
        <div style={{ display: 'flex', gap: '.5rem' }}>
          <button className='btn' onClick={async () => { await supabase.from('tasks').eq('id', t.id).update({ completed: !t.completed }); load(); }}>{t.completed ? 'Undo' : 'Complete'}</button>
        </div>
      </div>)}
    </div>
  </div>;
}
