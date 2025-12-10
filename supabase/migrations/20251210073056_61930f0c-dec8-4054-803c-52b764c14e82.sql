-- Add INSERT, UPDATE, DELETE policies to schools table (admin only)
CREATE POLICY "Admins can insert schools"
ON public.schools
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update schools"
ON public.schools
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete schools"
ON public.schools
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Add DELETE policy to profiles table (users can delete their own profile)
CREATE POLICY "Users can delete own profile"
ON public.profiles
FOR DELETE
TO authenticated
USING (auth.uid() = id);

-- Add admin UPDATE policy to user_schools for complete admin control
CREATE POLICY "Admins can update user_schools"
ON public.user_schools
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));