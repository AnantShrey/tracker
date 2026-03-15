'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase-client';
import { localDateISO } from '@/lib/utils';
import { toast } from 'sonner';

export default function HabitsPage() {
  const [habits, setHabits] = useState<any[]>([]);
  const [name, setName] = useState('');

  const load = async () => {
    const { data } = await supabase.from('habits').order('created_at', { ascending: false }).select('*');
    setHabits(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!name.trim()) return toast.error('Habit name required');
    const { error } = await supabase.from('habits').insert({ name, target_days: 7 });
    if (error) return toast.error(error.message);
    setName('');
    toast.success('Habit added');
    load();
  };

  return <div className='card'>
    <h1>Habit Tracker</h1>
    <div className='item'><input className='input' value={name} onChange={(e) => setName(e.target.value)} placeholder='New habit...' /><button className='btn' onClick={add}>Add</button></div>
    <div className='list' style={{ marginTop: '1rem' }}>
      {habits.length === 0 && <div className='empty'>🧭 No habits yet. Create your first streak habit.</div>}
      {habits.map((h) => <div key={h.id} className='item'>
        <span>{h.name}</span>
        <div style={{ display: 'flex', gap: '.5rem' }}>
          <button className='btn' onClick={async () => { await supabase.from('habit_completions').upsert({ habit_id: h.id, completed_on: localDateISO(), completed: true }); toast.success('Marked complete'); }}>Done today</button>
          <button className='btn' onClick={async () => { await supabase.from('habits').eq('id', h.id).update({ name: `${h.name} ✏️` }); load(); }}>Edit</button>
          <button className='btn' onClick={async () => { await supabase.from('habits').eq('id', h.id).delete(); load(); }}>Delete</button>
        </div>
      </div>)}
    </div>
  </div>;
}
