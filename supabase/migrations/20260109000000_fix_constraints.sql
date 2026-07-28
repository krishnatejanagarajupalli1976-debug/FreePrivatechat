-- Fix max_users constraint to allow up to 100
ALTER TABLE public.rooms DROP CONSTRAINT IF EXISTS rooms_max_users_check;
ALTER TABLE public.rooms ADD CONSTRAINT rooms_max_users_check CHECK (max_users >= 2 AND max_users <= 100);

-- Fix message_type constraint to include 'video'
ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_message_type_check;
ALTER TABLE public.messages ADD CONSTRAINT messages_message_type_check 
  CHECK (message_type IN ('text', 'system', 'image', 'file', 'voice', 'video'));
