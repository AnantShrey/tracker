'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase-client';
import { localDateISO } from '@/lib/utils';

export default function NutritionPage() {
  const [target, setTarget] = useState({ calories: 2200, protein: 150, carbs: 220, fats: 70 });
  const [meal, setMeal] = useState({ name: '', calories: 0, protein: 0, carbs: 0, fats: 0 });
  const [meals, setMeals] = useState<any[]>([]);
  const today = localDateISO();

  const load = async () => {
    const { data: t } = await supabase.from('nutrition_targets').eq('target_date', today).single();
    const { data: m } = await supabase.from('meal_entries').eq('consumed_on', today).select('*');
    if (t) setTarget(t);
    setMeals(m ?? []);
  };
  useEffect(() => { load(); }, []);

  const consumed = meals.reduce((acc, m) => ({
    calories: acc.calories + m.calories, protein: acc.protein + m.protein, carbs: acc.carbs + m.carbs, fats: acc.fats + m.fats
  }), { calories: 0, protein: 0, carbs: 0, fats: 0 });

  return <div className='grid'>
    <div className='card'><h1>Daily Target</h1>
      <div className='list'>{['calories', 'protein', 'carbs', 'fats'].map((k) => <input key={k} className='input' value={(target as any)[k]} onChange={(e) => setTarget({ ...target, [k]: Number(e.target.value) })} />)}</div>
      <button className='btn' onClick={async () => { await supabase.from('nutrition_targets').upsert({ ...target, target_date: today }); }}>Save target</button>
    </div>
    <div className='card'><h1>Meal Entry</h1>
      <div className='list'>
        <input className='input' placeholder='Meal name' value={meal.name} onChange={(e) => setMeal({ ...meal, name: e.target.value })} />
        {['calories', 'protein', 'carbs', 'fats'].map((k) => <input key={k} className='input' type='number' value={(meal as any)[k]} onChange={(e) => setMeal({ ...meal, [k]: Number(e.target.value) })} />)}
      </div>
      <button className='btn' onClick={async () => { await supabase.from('meal_entries').insert({ ...meal, consumed_on: today }); setMeal({ name: '', calories: 0, protein: 0, carbs: 0, fats: 0 }); load(); }}>Add meal</button>
      <p>Remaining: {target.calories - consumed.calories} kcal</p>
    </div>
  </div>;
}
