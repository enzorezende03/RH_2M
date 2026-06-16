UPDATE public.profiles SET primeiro_acesso = true WHERE user_id = 'c78a4dea-8fd3-4cac-8157-1dbb9d1ab6a4';
-- Reset auth password to the default so she can log in with "Primeiro acesso"
UPDATE auth.users SET encrypted_password = crypt('2m_UsuarioRH', gen_salt('bf')), updated_at = now() WHERE id = 'c78a4dea-8fd3-4cac-8157-1dbb9d1ab6a4';