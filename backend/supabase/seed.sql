CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA extensions;

-- Insert into auth.users with a static UUID
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    'a1b2c3d4-e5f6-7890-1234-56789abcdef0',
    'authenticated',
    'authenticated',
    'testuser@example.com',
    extensions.crypt('password123', extensions.gen_salt('bf')),
    current_timestamp,
    '{"provider":"email","providers":["email"]}',
    '{}',
    current_timestamp,
    current_timestamp
);

-- Insert the linked email identity
INSERT INTO auth.identities (
    id,
    user_id,
    provider_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'a1b2c3d4-e5f6-7890-1234-56789abcdef0',
    'a1b2c3d4-e5f6-7890-1234-56789abcdef0',
    jsonb_build_object('sub', 'a1b2c3d4-e5f6-7890-1234-56789abcdef0', 'email', 'testuser@example.com'),
    'email',
    current_timestamp,
    current_timestamp,
    current_timestamp
);

INSERT INTO public.merchant (
    id,
    name,
    latitude,
    longitude,
    location_photo,
    start_operating_time,
    end_operating_time,
    operating_days,
    location
) VALUES (
    'a1b2c3d4-e5f6-7890-1234-56789abcdef0',
    'Freshlast Test Merchant',
    10.3157,    -- Cebu City latitude
    123.8854,   -- Cebu City longitude
    'https://example.com/placeholder-photo.jpg',
    '08:00:00',
    '17:00:00',
    ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']::varchar[],
    'Cebu City, Central Visayas, Philippines'
);
