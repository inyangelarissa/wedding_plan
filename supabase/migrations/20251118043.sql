-- Add foreign key relationship between booking_requests and profiles
ALTER TABLE public.booking_requests
ADD CONSTRAINT booking_requests_requester_id_fkey
FOREIGN KEY (requester_id) REFERENCES auth.users(id) ON DELETE CASCADE;