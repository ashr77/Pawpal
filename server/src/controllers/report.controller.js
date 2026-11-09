const db = require('../config/db');

async function createReport(req, res, next) {
  try {
    const {
      report_type,
      animal_type,
      location,
      description,
      animal_condition,
      contact_information,
      urgency = 'Normal',
      image_url = '',
    } = req.body;

    const reporter_id = req.session.user.id;

    const result = await db.query(
      `INSERT INTO rescue_reports (
        reporter_id,
        report_type,
        animal_type,
        image_url,
        location,
        description,
        animal_condition,
        contact_information,
        urgency,
        status,
        verification_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'Active', 'Unverified')
      RETURNING *;`,
      [
        reporter_id,
        report_type,
        animal_type,
        image_url,
        location,
        description,
        animal_condition,
        contact_information,
        urgency,
      ]
    );

    return res.status(201).json({
      message: 'Rescue report created successfully',
      report: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
}

async function getAllReports(req, res, next) {
  try {
    // Fetch reports along with reporter name
    const query = `
      SELECT 
        r.id,
        r.reporter_id,
        u.name AS reporter_name,
        r.report_type,
        r.animal_type,
        r.image_url,
        r.location,
        r.description,
        r.animal_condition,
        r.contact_information,
        r.urgency,
        r.status,
        r.verification_status,
        r.created_at,
        r.updated_at
      FROM rescue_reports r
      JOIN users u ON r.reporter_id = u.id
      ORDER BY r.created_at DESC;
    `;

    const result = await db.query(query);
    return res.json({ reports: result.rows });
  } catch (err) {
    next(err);
  }
}

async function getReportById(req, res, next) {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        r.id,
        r.reporter_id,
        u.name AS reporter_name,
        u.email AS reporter_email,
        r.report_type,
        r.animal_type,
        r.image_url,
        r.location,
        r.description,
        r.animal_condition,
        r.contact_information,
        r.urgency,
        r.status,
        r.verification_status,
        r.created_at,
        r.updated_at
      FROM rescue_reports r
      JOIN users u ON r.reporter_id = u.id
      WHERE r.id = $1;
    `;

    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Rescue report not found.' });
    }

    return res.json({ report: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createReport,
  getAllReports,
  getReportById,
};

