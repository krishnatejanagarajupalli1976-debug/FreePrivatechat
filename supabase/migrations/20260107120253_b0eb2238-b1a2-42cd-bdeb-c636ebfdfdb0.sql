-- Fix function search paths for security
CREATE OR REPLACE FUNCTION public.generate_room_code()
RETURNS TEXT 
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..10 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.get_active_participant_count(p_room_id UUID)
RETURNS INTEGER 
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM public.room_participants WHERE room_id = p_room_id AND is_active = true);
END;
$$ LANGUAGE plpgsql;