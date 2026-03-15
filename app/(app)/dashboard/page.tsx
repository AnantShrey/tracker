'use client';
import { useEffect, useState } from 'react';
import { getDashboardMetrics, runDailyRollover } from '@/lib/data';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<any>();
  useEffect(() => { runDailyRollover(); getDashboardMetrics().then(setMetrics); }, []);
  if (!metrics) return <div className='grid'>{Array.from({ length: 6 }).map((_, i) => <div className='skeleton' key={i} />)}</div>;
  return <div className='grid'>
    <div className='card'><h3>Current Habit Streak</h3><h2>{metrics.currentStreak}</h2></div>
    <div className='card'><h3>Highest Habit Streak</h3><h2>{metrics.bestStreak}</h2></div>
    <div className='card'><h3>Habit Success</h3><h2>{metrics.successPct}%</h2></div>
    <div className='card'><h3>Tasks Remaining Today</h3><h2>{metrics.tasksRemaining}</h2></div>
    <div className='card'><h3>Remaining Calories</h3><h2>{metrics.remainingMeals.calories}</h2></div>
    <div className='card'><h3>Active Habits</h3><h2>{metrics.habitsCount}</h2></div>
  </div>;
}
