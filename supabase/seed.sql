-- Dummy merchant for testing

DO $$
DECLARE
  merchant_id uuid := '11111111-1111-1111-1111-111111111111';
  merchant_email text := 'merchant@example.com';
  file_id uuid := '22222222-2222-2222-2222-222222222222';
  file_path text;
  photo_url text;
BEGIN
  file_path := merchant_id || '/profile/' || file_id;
  photo_url := 'http://127.0.0.1:54321/storage/v1/object/public/media/' || file_path;

  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    merchant_id,
    'authenticated',
    'authenticated',
    merchant_email,
    extensions.crypt ('password123', extensions.gen_salt('bf')),
    current_timestamp,
    current_timestamp,
    current_timestamp,
    '{"provider":"email","providers":["email"]}',
    '{}',
    current_timestamp,
    current_timestamp,
    '',
    '',
    '',
    ''
  );

  INSERT INTO auth.identities (
    id,
    user_id,
    provider_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  )
  VALUES (
    extensions.uuid_generate_v4(),
    merchant_id,
    merchant_id,
    format('{"sub":"%s","email":"%s"}', merchant_id, merchant_email)::jsonb,
    'email',
    current_timestamp,
    current_timestamp,
    current_timestamp
  );

  INSERT INTO storage.buckets (id, name, public)
  VALUES ('media', 'media', true)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO storage.objects (
    id,
    bucket_id,
    name,
    owner,
    created_at,
    updated_at,
    metadata
  )
  VALUES (
    file_id,
    'media',
    file_path,
    merchant_id,
    now(),
    now(),
    '{"mimetype":"image/jpeg","size":0}'
  );

  INSERT INTO public.merchant (
    id,
    name,
    latitude,
    longitude,
    start_operating_time,
    end_operating_time,
    operating_days,
    location,
    location_photo,
    category,
    phone_number
  )
  VALUES (
    merchant_id,
    'Sample Merchant',
    10.3157,
    123.8854,
    '08:00:00',
    '18:00:00',
    ARRAY['Mon', 'Wed', 'Fri'],
    'Cebu City, Philippines',
    photo_url,
    'Veggies',
    '+639123456789'
  );
END $$;
