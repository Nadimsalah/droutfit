-- RUN THIS IN YOUR SUPABASE SQL EDITOR TO FIX UPLOADS

-- 1. Create the tryimages bucket if it doesn't exist
insert into storage.buckets (id, name, public) 
values ('tryimages', 'tryimages', true)
on conflict (id) do update set public = true;

-- 2. Allow public access to view images
create policy "Public Access" 
  on storage.objects for select 
  using ( bucket_id = 'tryimages' );

-- 3. Allow anonymous uploads (for widget users)
create policy "Allow Public Uploads" 
  on storage.objects for insert 
  with check ( bucket_id = 'tryimages' );

-- 4. Allow merchants to update/delete their own uploads (optional fallback)
create policy "Allow Update" 
  on storage.objects for update 
  using ( bucket_id = 'tryimages' );
