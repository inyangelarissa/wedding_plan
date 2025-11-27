-- Create booking_requests table
CREATE TABLE public.booking_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL,
  request_date DATE NOT NULL,
  guest_count INTEGER,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create venue_availability table
CREATE TABLE public.venue_availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(venue_id, date)
);

-- Enable RLS
ALTER TABLE public.booking_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_availability ENABLE ROW LEVEL SECURITY;

-- RLS Policies for booking_requests
CREATE POLICY "Everyone can view booking requests"
  ON public.booking_requests
  FOR SELECT
  USING (true);

CREATE POLICY "Users can create booking requests"
  ON public.booking_requests
  FOR INSERT
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Venue managers can update booking requests for their venues"
  ON public.booking_requests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.venues
      WHERE venues.id = booking_requests.venue_id
      AND venues.manager_id = auth.uid()
    )
  );

-- RLS Policies for venue_availability
CREATE POLICY "Everyone can view venue availability"
  ON public.venue_availability
  FOR SELECT
  USING (true);

CREATE POLICY "Venue managers can manage availability for their venues"
  ON public.venue_availability
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.venues
      WHERE venues.id = venue_availability.venue_id
      AND venues.manager_id = auth.uid()
    )
  );

-- Add triggers for updated_at
CREATE TRIGGER update_booking_requests_updated_at
  BEFORE UPDATE ON public.booking_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_venue_availability_updated_at
  BEFORE UPDATE ON public.venue_availability
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();