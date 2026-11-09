const bcrypt = require('bcrypt');
const { pool } = require('./db');

async function seed() {
  const client = await pool.connect();
  try {
    console.log('🌱 Starting database seeding...');
    await client.query('BEGIN');

    const saltRounds = 10;
    const userPass = await bcrypt.hash('Password123!', saltRounds);
    const adminPass = await bcrypt.hash('Admin123!', saltRounds);

    // Insert or update demo regular user
    const userRes = await client.query(
      `INSERT INTO users (name, email, password_hash, phone, area, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO UPDATE SET 
         name = EXCLUDED.name,
         password_hash = EXCLUDED.password_hash,
         phone = EXCLUDED.phone,
         area = EXCLUDED.area,
         role = EXCLUDED.role
       RETURNING id;`,
      ['Demo User', 'demo@pawpal.com', userPass, '01700000001', 'Dhanmondi, Dhaka', 'USER']
    );
    const userId = userRes.rows[0].id;

    // Insert or update demo admin user
    await client.query(
      `INSERT INTO users (name, email, password_hash, phone, area, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO UPDATE SET 
         name = EXCLUDED.name,
         password_hash = EXCLUDED.password_hash,
         phone = EXCLUDED.phone,
         area = EXCLUDED.area,
         role = EXCLUDED.role
       RETURNING id;`,
      ['Admin User', 'admin@pawpal.com', adminPass, '01700000002', 'Banani, Dhaka', 'ADMIN']
    );

    // Insert sample rescue reports if none exist
    const countRes = await client.query('SELECT COUNT(*) FROM rescue_reports;');
    if (parseInt(countRes.rows[0].count, 10) === 0) {
      await client.query(
        `INSERT INTO rescue_reports 
          (reporter_id, report_type, animal_type, image_url, location, description, animal_condition, contact_information, urgency, status, verification_status)
         VALUES 
          ($1, 'Injured', 'Cat', '', 'Road 8A, Dhanmondi, Dhaka', 'Found a young stray cat with an injured front leg near Dhanmondi lake. Seems dehydrated.', 'Limping and unable to walk properly', '01700000001', 'Critical', 'Active', 'Verified'),
          ($1, 'Abandoned', 'Dog', '', 'Mirpur 10 roundabout, Dhaka', 'Puppy left in a cardboard box near the bus station. Looking for immediate shelter.', 'Healthy but visibly scared and cold', '01700000001', 'Urgent', 'Active', 'Unverified');`,
        [userId]
      );
      console.log('✅ Sample rescue reports inserted.');
    }

    await client.query('COMMIT');
    console.log('✅ Seeding completed successfully!');
    console.log('   Demo User:  demo@pawpal.com  / Password123!');
    console.log('   Admin User: admin@pawpal.com / Admin123!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();

