exports.up = (pgm) => {
  pgm.sql(`
    -- 1. Rescue Updates (Chronological timeline progress)
    CREATE TABLE IF NOT EXISTS rescue_updates (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      report_id UUID NOT NULL REFERENCES rescue_reports(id) ON DELETE CASCADE,
      author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      event_type VARCHAR(100) NOT NULL,
      description TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    -- 2. Volunteer Assistance Offers
    CREATE TABLE IF NOT EXISTS help_offers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      report_id UUID NOT NULL REFERENCES rescue_reports(id) ON DELETE CASCADE,
      volunteer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      help_type VARCHAR(50) NOT NULL CHECK (help_type IN ('Rescue', 'Transportation', 'Temporary Shelter', 'Veterinary Help', 'Financial Help')),
      message TEXT,
      status VARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Accepted', 'Declined', 'Completed', 'Cancelled')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    -- 3. Indexes for fast query filtering, priority sorting, and relational lookups
    CREATE INDEX IF NOT EXISTS idx_rescue_updates_report_id ON rescue_updates(report_id, created_at ASC);
    CREATE INDEX IF NOT EXISTS idx_help_offers_report_id ON help_offers(report_id);
    CREATE INDEX IF NOT EXISTS idx_help_offers_volunteer_id ON help_offers(volunteer_id);
    CREATE INDEX IF NOT EXISTS idx_rescue_reports_urgency_created ON rescue_reports(urgency, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_rescue_reports_status ON rescue_reports(status);
    CREATE INDEX IF NOT EXISTS idx_rescue_reports_location ON rescue_reports(location);
    CREATE INDEX IF NOT EXISTS idx_rescue_reports_animal_type ON rescue_reports(animal_type);
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DROP INDEX IF EXISTS idx_rescue_reports_animal_type;
    DROP INDEX IF EXISTS idx_rescue_reports_location;
    DROP INDEX IF EXISTS idx_rescue_reports_status;
    DROP INDEX IF EXISTS idx_rescue_reports_urgency_created;
    DROP INDEX IF EXISTS idx_help_offers_volunteer_id;
    DROP INDEX IF EXISTS idx_help_offers_report_id;
    DROP INDEX IF EXISTS idx_rescue_updates_report_id;

    DROP TABLE IF EXISTS help_offers;
    DROP TABLE IF EXISTS rescue_updates;
  `);
};
