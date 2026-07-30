-- Give every existing account a base shopper role
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'user'::app_role FROM auth.users u
ON CONFLICT (user_id, role) DO NOTHING;

-- Grant admin to the store owner
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'admin'::app_role FROM auth.users u WHERE lower(u.email) = 'dan@dlcts.co.uk'
ON CONFLICT (user_id, role) DO NOTHING;