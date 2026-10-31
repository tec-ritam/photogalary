-- Create public photos bucket in Supabase storage
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'photos',
  'photos',
  true,
  52428800,
  array['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']
)
on conflict (id) do update set public = true;

-- Allow public read access on photos bucket
create policy "Public Access to Photos" on storage.objects for select using (bucket_id = 'photos');

-- Allow public upload access on photos bucket
create policy "Public Upload to Photos" on storage.objects for insert with check (bucket_id = 'photos');

-- Allow public update/delete access on photos bucket
create policy "Public Update Photos" on storage.objects for update using (bucket_id = 'photos');
create policy "Public Delete Photos" on storage.objects for delete using (bucket_id = 'photos');
