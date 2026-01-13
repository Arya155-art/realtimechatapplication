-- Add database constraints for username validation
ALTER TABLE public.profiles
ADD CONSTRAINT username_length_check 
  CHECK (length(username) >= 2 AND length(username) <= 20);

ALTER TABLE public.profiles
ADD CONSTRAINT username_format_check 
  CHECK (username ~ '^[a-zA-Z0-9_-]+$');

ALTER TABLE public.profiles
ADD CONSTRAINT username_unique UNIQUE (username);

-- Update handle_new_user trigger with server-side validation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_username TEXT;
  v_clean_username TEXT;
  v_counter INT := 0;
BEGIN
  -- Get username from metadata or derive from email
  v_username := COALESCE(
    NULLIF(trim(NEW.raw_user_meta_data ->> 'username'), ''),
    split_part(NEW.email, '@', 1)
  );
  
  -- Enforce length constraints (2-20 characters)
  IF length(v_username) < 2 OR length(v_username) > 20 THEN
    v_username := substring(split_part(NEW.email, '@', 1), 1, 20);
    IF length(v_username) < 2 THEN
      v_username := 'user_' || substring(NEW.id::text, 1, 8);
    END IF;
  END IF;
  
  -- Validate allowed characters (alphanumeric, underscore, hyphen only)
  IF v_username !~ '^[a-zA-Z0-9_-]+$' THEN
    v_clean_username := regexp_replace(v_username, '[^a-zA-Z0-9_-]', '', 'g');
    IF length(v_clean_username) >= 2 THEN
      v_username := substring(v_clean_username, 1, 20);
    ELSE
      -- Fallback to email-based username
      v_username := regexp_replace(
        substring(split_part(NEW.email, '@', 1), 1, 20),
        '[^a-zA-Z0-9_-]', '', 'g'
      );
      IF length(v_username) < 2 THEN
        v_username := 'user_' || substring(NEW.id::text, 1, 8);
      END IF;
    END IF;
  END IF;
  
  -- Handle duplicates with unique suffix
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = v_username) LOOP
    v_counter := v_counter + 1;
    v_username := substring(v_username, 1, 15) || '_' || v_counter::text;
    -- Prevent infinite loop
    IF v_counter > 100 THEN
      v_username := 'user_' || substring(NEW.id::text, 1, 12);
      EXIT;
    END IF;
  END LOOP;
  
  INSERT INTO public.profiles (user_id, username)
  VALUES (NEW.id, v_username);
  
  RETURN NEW;
END;
$$;