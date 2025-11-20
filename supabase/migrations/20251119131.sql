-- Create storage bucket for vendor portfolios
INSERT INTO storage.buckets (id, name, public)
VALUES ('vendor-portfolios', 'vendor-portfolios', true);

-- RLS policies for vendor portfolios bucket
CREATE POLICY "Vendor portfolio images are publicly accessible"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'vendor-portfolios');

CREATE POLICY "Vendors can upload their own portfolio images"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'vendor-portfolios' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Vendors can update their own portfolio images"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'vendor-portfolios' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Vendors can delete their own portfolio images"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'vendor-portfolios' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create vendor_inquiries table
CREATE TABLE public.vendor_inquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  inquirer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'responded', 'accepted', 'declined')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.vendor_inquiries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vendor_inquiries
CREATE POLICY "Everyone can view vendor inquiries"
  ON public.vendor_inquiries
  FOR SELECT
  USING (true);

CREATE POLICY "Users can create vendor inquiries"
  ON public.vendor_inquiries
  FOR INSERT
  WITH CHECK (auth.uid() = inquirer_id);

CREATE POLICY "Vendor owners can update inquiries for their vendors"
  ON public.vendor_inquiries
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.vendors
      WHERE vendors.id = vendor_inquiries.vendor_id
      AND vendors.user_id = auth.uid()
    )
  );

-- Add trigger for updated_at
CREATE TRIGGER update_vendor_inquiries_updated_at
  BEFORE UPDATE ON public.vendor_inquiries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();