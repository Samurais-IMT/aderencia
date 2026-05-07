
-- Allow admins to view all evaluations
CREATE POLICY "Admins can view all evaluations"
ON public.evaluations
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to update all evaluations
CREATE POLICY "Admins can update all evaluations"
ON public.evaluations
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Allow admins to delete all evaluations
CREATE POLICY "Admins can delete all evaluations"
ON public.evaluations
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
