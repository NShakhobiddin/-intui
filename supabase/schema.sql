-- Intui — bulut sinxronlash sxemasi
-- Supabase dashboard > SQL Editor ga shu faylni joylashtirib "Run" bosing.

create table if not exists public.states (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.states enable row level security;

-- Har bir foydalanuvchi faqat o'z yozuvini o'qiy oladi va yoza oladi
create policy "own state select" on public.states
  for select using (auth.uid() = user_id);

create policy "own state insert" on public.states
  for insert with check (auth.uid() = user_id);

create policy "own state update" on public.states
  for update using (auth.uid() = user_id);
