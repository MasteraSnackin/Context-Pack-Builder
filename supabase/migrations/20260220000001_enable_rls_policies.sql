-- Fix Bug #2: Enable RLS policies for context_packs table
-- These were commented out in the original migration — enabling them now
-- so that users can only read/write their own context packs.
--
-- NOTE: user_id is stored as the Clerk user ID (text), not auth.uid().
-- For server-side access (service role key), RLS is bypassed automatically.
-- These policies protect against any future client-side / anon access.

-- Policy: Users can view only their own context packs
create policy "Users can view their own context packs"
  on context_packs for select
  using (user_id = current_setting('app.current_user_id', true));

-- Policy: Users can insert only their own context packs
create policy "Users can insert their own context packs"
  on context_packs for insert
  with check (user_id = current_setting('app.current_user_id', true));

-- Policy: Users can delete only their own context packs
create policy "Users can delete their own context packs"
  on context_packs for delete
  using (user_id = current_setting('app.current_user_id', true));
