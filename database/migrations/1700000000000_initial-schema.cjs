exports.up = (pgm) => {
  pgm.sql(`
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";

    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      phone VARCHAR(50),
      area VARCHAR(100),
      role VARCHAR(20) NOT NULL DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS rescue_reports (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      report_type VARCHAR(50) NOT NULL CHECK (report_type IN ('Injured', 'Abandoned', 'Stray', 'Lost', 'Found')),
      animal_type VARCHAR(50) NOT NULL,
      image_url TEXT,
      location TEXT NOT NULL,
      description TEXT NOT NULL,
      animal_condition TEXT,
      contact_information TEXT NOT NULL,
      urgency VARCHAR(20) NOT NULL DEFAULT 'Normal' CHECK (urgency IN ('Critical', 'Urgent', 'Normal')),
      status VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'In Progress', 'Resolved')),
      verification_status VARCHAR(20) NOT NULL DEFAULT 'Unverified' CHECK (verification_status IN ('Unverified', 'Verified')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS "session" (
      "sid" VARCHAR NOT NULL COLLATE "default",
      "sess" JSON NOT NULL,
      "expire" TIMESTAMP(6) NOT NULL,
      CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
    );
    CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DROP TABLE IF EXISTS "session";
    DROP TABLE IF EXISTS rescue_reports;
    DROP TABLE IF EXISTS users;
  `);
};
