import { supabase } from './supabase-client';
import { localDateISO } from './utils';

export const getDashboardMetrics = async () => {
  const today = localDateISO();
  const [{ data: habits }, { data: completions }, { data: tasks }, { data: targets }, { data: meals }] = await Promise.all([
    supabase.from('habits').select('*'),
    supabase.from('habit_completions').select('*'),
    supabase.from('tasks').eq('due_date', today).select('*'),
    supabase.from('nutrition_targets').eq('target_date', today).single(),
    supabase.from('meal_entries').eq('consumed_on', today).select('*')
  ]);

  const byHabit = new Map<string, string[]>();
  (completions ?? []).forEach((c) => {
    if (!c.completed) return;
    byHabit.set(c.habit_id, [...(byHabit.get(c.habit_id) ?? []), c.completed_on]);
  });
  const streaks = [...byHabit.values()].map((dates) => dates.sort().length);

  const completeCount = (completions ?? []).filter((c) => c.completed).length;
  const totalCompletions = (completions ?? []).length || 1;
  const remainingMeals = {
    calories: (targets?.calories ?? 0) - (meals ?? []).reduce((a, m) => a + m.calories, 0),
    protein: (targets?.protein ?? 0) - (meals ?? []).reduce((a, m) => a + m.protein, 0),
    carbs: (targets?.carbs ?? 0) - (meals ?? []).reduce((a, m) => a + m.carbs, 0),
    fats: (targets?.fats ?? 0) - (meals ?? []).reduce((a, m) => a + m.fats, 0)
  };

  return {
    currentStreak: streaks[0] ?? 0,
    bestStreak: Math.max(0, ...streaks),
    successPct: Math.round((completeCount / totalCompletions) * 100),
    tasksRemaining: (tasks ?? []).filter((t) => !t.completed).length,
    remainingMeals,
    habitsCount: habits?.length ?? 0
  };
};

export const runDailyRollover = async () => fetch('/api/daily-rollover', { method: 'POST' });
