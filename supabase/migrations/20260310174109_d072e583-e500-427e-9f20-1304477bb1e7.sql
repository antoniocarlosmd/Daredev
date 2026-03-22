
-- Drop existing constraint if it exists, then re-add pointing to profiles
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_user_id_fkey;
ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_user_id_fkey;
ALTER TABLE public.payments
  ADD CONSTRAINT payments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Delete morning classes (only keep 16:00-20:00)
DELETE FROM public.classes WHERE time_slot IN ('06:00', '07:00', '08:00', '09:00', '10:00', '11:00');

-- Add scheduled_days column to profiles for weekday selection
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS scheduled_days integer[] DEFAULT NULL;
