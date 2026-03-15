export type Habit = { id: string; name: string; target_days: number; created_at: string };
export type HabitCompletion = { id: string; habit_id: string; completed_on: string; completed: boolean };
export type Task = { id: string; title: string; due_date: string; completed: boolean; carried_from?: string | null };
export type NutritionTarget = { calories: number; protein: number; carbs: number; fats: number };
export type MealEntry = { id: string; name: string; calories: number; protein: number; carbs: number; fats: number; consumed_on: string };
export type Book = { id: string; title: string; total_pages: number; status: 'active' | 'paused' | 'completed'; started_on: string; completed_on?: string | null };
export type BookLog = { id: string; book_id: string; pages_read: number; logged_on: string };
