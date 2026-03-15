-- Enable extension for UUID generation if needed
create extension if not exists pgcrypto;

create table if not exists habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  name text not null,
  target_days int not null default 7,
  created_at timestamptz not null default now()
);

create table if not exists habit_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  habit_id uuid not null references habits(id) on delete cascade,
  completed_on date not null,
  completed boolean not null default false,
  unique (habit_id, completed_on)
);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  title text not null,
  due_date date not null,
  completed boolean not null default false,
  carried_from date,
  created_at timestamptz not null default now()
);

create table if not exists nutrition_targets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  target_date date not null,
  calories int not null default 2200,
  protein int not null default 150,
  carbs int not null default 220,
  fats int not null default 70,
  unique(user_id, target_date)
);

create table if not exists meal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  name text not null,
  calories int not null default 0,
  protein int not null default 0,
  carbs int not null default 0,
  fats int not null default 0,
  consumed_on date not null,
  created_at timestamptz not null default now()
);

create table if not exists books (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  title text not null,
  total_pages int not null,
  status text not null default 'active' check (status in ('active','paused','completed')),
  started_on date not null,
  completed_on date,
  created_at timestamptz not null default now()
);

create table if not exists book_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  book_id uuid not null references books(id) on delete cascade,
  pages_read int not null,
  logged_on date not null,
  created_at timestamptz not null default now()
);

alter table habits enable row level security;
alter table habit_completions enable row level security;
alter table tasks enable row level security;
alter table nutrition_targets enable row level security;
alter table meal_entries enable row level security;
alter table books enable row level security;
alter table book_logs enable row level security;

create policy "user owns habits" on habits for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "user owns completions" on habit_completions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "user owns tasks" on tasks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "user owns targets" on nutrition_targets for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "user owns meals" on meal_entries for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "user owns books" on books for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "user owns logs" on book_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists idx_tasks_due_date on tasks(user_id, due_date, completed);
create index if not exists idx_habit_completions_date on habit_completions(user_id, completed_on);

-- Optional: example daily rollover function (schedule via pg_cron / Supabase cron)
create or replace function daily_rollover_for_user(target_user uuid, today date)
returns void language plpgsql as $$
begin
  insert into tasks (user_id, title, due_date, completed, carried_from)
  select user_id, title, today, false, due_date
  from tasks
  where user_id = target_user and completed = false and due_date < today
  and not exists (
    select 1 from tasks t2 where t2.user_id = target_user and t2.title = tasks.title and t2.due_date = today
  );
end;
$$;
