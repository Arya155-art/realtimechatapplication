-- Make the chat-files bucket private
UPDATE storage.buckets SET public = false WHERE id = 'chat-files';