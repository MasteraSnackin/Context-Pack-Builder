-- Create context_packs table
create table context_packs (
  id uuid default gen_random_uuid() primary key,
  user_id text not null,
  title text not null,                      -- User's goal description
  summary text,                              -- LLM-generated summary
  resources jsonb default '[]'::jsonb,       -- [{type, title, url, snippet}]
  open_questions jsonb default '[]'::jsonb,  -- [string]
  next_actions jsonb default '[]'::jsonb,    -- [string]
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table context_packs enable row level security;

-- Create index for efficient queries
create index idx_context_packs_user_created on context_packs(user_id, created_at desc);

-- Optional: Add RLS policies (uncomment if needed)
-- create policy "Users can view their own context packs"
--   on context_packs for select
--   using (user_id = auth.uid()::text);
--
-- create policy "Users can insert their own context packs"
--   on context_packs for insert
--   with check (user_id = auth.uid()::text);
