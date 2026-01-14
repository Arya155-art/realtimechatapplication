-- Change chat-files bucket from public to private for better security
-- The application already uses signed URLs so no code changes needed
UPDATE storage.buckets SET public = false WHERE id = 'chat-files';