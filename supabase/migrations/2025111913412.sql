-- Add approval status to vendors and venues tables
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected'));
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

ALTER TABLE venues ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected'));
ALTER TABLE venues ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Create a function to check if user has admin role
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_roles.user_id = $1
    AND role = 'admin'
  )
$$;

-- Update RLS policies for admin access to all tables
CREATE POLICY "Admins can manage all vendors"
ON vendors
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage all venues"
ON venues
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage all profiles"
ON profiles
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage all user roles"
ON user_roles
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage all events"
ON events
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Update vendor and venue visibility to only show approved ones to non-admins
DROP POLICY IF EXISTS "Everyone can view vendors" ON vendors;
CREATE POLICY "Everyone can view approved vendors"
ON vendors
FOR SELECT
TO authenticated
USING (approval_status = 'approved' OR public.is_admin(auth.uid()) OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Everyone can view venues" ON venues;
CREATE POLICY "Everyone can view approved venues"
ON venues
FOR SELECT
TO authenticated
USING (approval_status = 'approved' OR public.is_admin(auth.uid()) OR auth.uid() = manager_id);