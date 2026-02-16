create table tasks (
  id uuid default gen_random_uuid() primary key,
  user_id text not null,
  title text not null,
  completed boolean default false,
  priority text default 'medium' check (priority in ('low', 'medium', 'high')),
  due_date date,
  created_at timestamptz default now()
);

alter table tasks enable row level security;
