/*
  # Insert admin user for SkinHealth app

  1. Changes
    - Insert admin user with predefined credentials
    - Admin email: admin@skinhealth.com
    - Admin password: SkinHealthAdmin2024!
  
  2. Notes
    - Uses DO block to check if user already exists before inserting
    - This ensures the migration is idempotent
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'admin@skinhealth.com'
  ) THEN
    INSERT INTO users (email, password, name, created_at)
    VALUES (
      'admin@skinhealth.com',
      'SkinHealthAdmin2024!',
      'Admin',
      now()
    );
  END IF;
END $$;