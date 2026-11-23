const db = require('../config/db');

/**
 * Create a new rescue report (Phase 1 + automatic initial timeline entry)
 */
async function createReport(req, res, next) {
  try {
    const {
      report_type,
      animal_type,
      location,
      description,
      animal_condition = '',
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

    const report = result.rows[0];

    // Auto-create initial timeline entry
    await db.query(
      `INSERT INTO rescue_updates (report_id, author_id, event_type, description)
       VALUES ($1, $2, 'Reported', 'Rescue report submitted to PawPal.');`,
      [report.id, reporter_id]
    );

    return res.status(201).json({
      message: 'Rescue report created successfully',
      report,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get all reports with multi-criteria search, filtering, and emergency priority sorting
 */
async function getAllReports(req, res, next) {
  try {
    const {
      search,
      area,
      animal_type,
      report_type,
      urgency,
      status,
      sort = 'emergency',
    } = req.query;

    const conditions = [];
    const params = [];
    let paramIndex = 1;

    // 1. Keyword search (across location, description, animal_condition, animal_type)
    if (search && search.trim() !== '') {
      conditions.push(`(
        r.location ILIKE $${paramIndex} OR 
        r.description ILIKE $${paramIndex} OR 
        r.animal_condition ILIKE $${paramIndex} OR 
        r.animal_type ILIKE $${paramIndex}
      )`);
      params.push(`%${search.trim()}%`);
      paramIndex++;
    }

    // 2. Area / location filter
    if (area && area.trim() !== '') {
      conditions.push(`r.location ILIKE $${paramIndex}`);
      params.push(`%${area.trim()}%`);
      paramIndex++;
    }

    // 3. Animal category filter
    if (animal_type && animal_type !== 'All') {
      conditions.push(`LOWER(r.animal_type) = LOWER($${paramIndex})`);
      params.push(animal_type);
      paramIndex++;
    }

    // 4. Report type filter (Injured, Abandoned, Stray, Lost, Found)
    if (report_type && report_type !== 'All') {
      conditions.push(`r.report_type = $${paramIndex}`);
      params.push(report_type);
      paramIndex++;
    }

    // 5. Urgency filter (Critical, Urgent, Normal)
    if (urgency && urgency !== 'All') {
      conditions.push(`r.urgency = $${paramIndex}`);
      params.push(urgency);
      paramIndex++;
    }

    // 6. Case status filter (Active, In Progress, Resolved)
    if (status && status !== 'All') {
      conditions.push(`r.status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Sorting logic: Emergency priority (Critical -> Urgent -> Normal, then newest) vs newest
    let orderClause = `ORDER BY 
      CASE 
        WHEN r.urgency = 'Critical' THEN 1 
        WHEN r.urgency = 'Urgent' THEN 2 
        WHEN r.urgency = 'Normal' THEN 3 
        ELSE 4 
      END ASC, 
      r.created_at DESC`;

    if (sort === 'newest') {
      orderClause = 'ORDER BY r.created_at DESC';
    }

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
        r.updated_at,
        (SELECT COUNT(*)::int FROM help_offers h WHERE h.report_id = r.id) AS offers_count,
        (SELECT COUNT(*)::int FROM rescue_updates u_sub WHERE u_sub.report_id = r.id) AS updates_count
      FROM rescue_reports r
      JOIN users u ON r.reporter_id = u.id
      ${whereClause}
      ${orderClause};
    `;

    const result = await db.query(query, params);
    return res.json({ reports: result.rows });
  } catch (err) {
    next(err);
  }
}

/**
 * Get single report by ID with reporter info and aggregate counts
 */
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
        r.updated_at,
        (SELECT COUNT(*)::int FROM help_offers h WHERE h.report_id = r.id) AS offers_count,
        (SELECT COUNT(*)::int FROM rescue_updates u_sub WHERE u_sub.report_id = r.id) AS updates_count
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

/**
 * Edit owned report details (PATCH /api/reports/:id)
 */
async function updateReport(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.session.user.id;
    const userRole = req.session.user.role;

    const checkRes = await db.query('SELECT reporter_id, status FROM rescue_reports WHERE id = $1;', [id]);
    if (checkRes.rows.length === 0) {
      return res.status(404).json({ error: 'Rescue report not found.' });
    }

    const report = checkRes.rows[0];
    if (report.reporter_id !== userId && userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Access forbidden. You can only edit your own rescue reports.' });
    }

    const {
      report_type,
      animal_type,
      location,
      description,
      animal_condition,
      contact_information,
      urgency,
      image_url,
    } = req.body;

    const updateRes = await db.query(
      `UPDATE rescue_reports
       SET 
         report_type = COALESCE($1, report_type),
         animal_type = COALESCE($2, animal_type),
         location = COALESCE($3, location),
         description = COALESCE($4, description),
         animal_condition = COALESCE($5, animal_condition),
         contact_information = COALESCE($6, contact_information),
         urgency = COALESCE($7, urgency),
         image_url = COALESCE($8, image_url),
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING *;`,
      [
        report_type,
        animal_type,
        location,
        description,
        animal_condition,
        contact_information,
        urgency,
        image_url,
        id,
      ]
    );

    return res.json({
      message: 'Rescue report updated successfully',
      report: updateRes.rows[0],
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Update rescue status (PATCH /api/reports/:id/status)
 * Allows reporter or Admin to transition Active -> In Progress -> Resolved.
 * Automatically logs a timeline update.
 */
async function updateReportStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.session.user.id;
    const userRole = req.session.user.role;

    const checkRes = await db.query('SELECT reporter_id, status FROM rescue_reports WHERE id = $1;', [id]);
    if (checkRes.rows.length === 0) {
      return res.status(404).json({ error: 'Rescue report not found.' });
    }

    const currentReport = checkRes.rows[0];
    if (currentReport.reporter_id !== userId && userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Access forbidden. Only the report creator or administrator can update status.' });
    }

    const oldStatus = currentReport.status;

    const updateRes = await db.query(
      `UPDATE rescue_reports
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *;`,
      [status, id]
    );

    // Automatically record status change in rescue progress timeline
    await db.query(
      `INSERT INTO rescue_updates (report_id, author_id, event_type, description)
       VALUES ($1, $2, 'Status Change', $3);`,
      [id, userId, `Rescue status transitioned from ${oldStatus} to ${status}.`]
    );

    return res.json({
      message: `Rescue status updated to ${status}`,
      report: updateRes.rows[0],
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Add a progress timeline update (POST /api/reports/:id/updates)
 */
async function addTimelineUpdate(req, res, next) {
  try {
    const { id } = req.params;
    const { event_type, description } = req.body;
    const userId = req.session.user.id;
    const userRole = req.session.user.role;

    const checkRes = await db.query('SELECT reporter_id FROM rescue_reports WHERE id = $1;', [id]);
    if (checkRes.rows.length === 0) {
      return res.status(404).json({ error: 'Rescue report not found.' });
    }

    if (checkRes.rows[0].reporter_id !== userId && userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Access forbidden. Only the report creator or administrator can add timeline updates.' });
    }

    const insertRes = await db.query(
      `INSERT INTO rescue_updates (report_id, author_id, event_type, description)
       VALUES ($1, $2, $3, $4)
       RETURNING id, report_id, author_id, event_type, description, created_at;`,
      [id, userId, event_type, description]
    );

    const newUpdate = insertRes.rows[0];
    newUpdate.author_name = req.session.user.name;

    return res.status(201).json({
      message: 'Rescue progress update added successfully',
      update: newUpdate,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get chronological timeline updates (GET /api/reports/:id/updates)
 */
async function getTimelineUpdates(req, res, next) {
  try {
    const { id } = req.params;

    const checkRes = await db.query('SELECT id FROM rescue_reports WHERE id = $1;', [id]);
    if (checkRes.rows.length === 0) {
      return res.status(404).json({ error: 'Rescue report not found.' });
    }

    const query = `
      SELECT 
        u.id,
        u.report_id,
        u.author_id,
        usr.name AS author_name,
        usr.role AS author_role,
        u.event_type,
        u.description,
        u.created_at
      FROM rescue_updates u
      JOIN users usr ON u.author_id = usr.id
      WHERE u.report_id = $1
      ORDER BY u.created_at ASC;
    `;

    const result = await db.query(query, [id]);
    return res.json({ updates: result.rows });
  } catch (err) {
    next(err);
  }
}

/**
 * Submit volunteer assistance offer (POST /api/reports/:id/offers)
 */
async function createHelpOffer(req, res, next) {
  try {
    const { id } = req.params;
    const { help_type, message = '' } = req.body;
    const volunteerId = req.session.user.id;

    const reportRes = await db.query('SELECT reporter_id, status FROM rescue_reports WHERE id = $1;', [id]);
    if (reportRes.rows.length === 0) {
      return res.status(404).json({ error: 'Rescue report not found.' });
    }

    const report = reportRes.rows[0];

    // Restriction: Cannot offer assistance on resolved cases
    if (report.status === 'Resolved') {
      return res.status(400).json({ error: 'Cannot submit assistance offers for resolved rescue cases.' });
    }

    // Reporter cannot volunteer for their own report
    if (report.reporter_id === volunteerId) {
      return res.status(400).json({ error: 'You cannot submit an assistance offer for your own report.' });
    }

    const insertRes = await db.query(
      `INSERT INTO help_offers (report_id, volunteer_id, help_type, message, status)
       VALUES ($1, $2, $3, $4, 'Pending')
       RETURNING *;`,
      [id, volunteerId, help_type, message]
    );

    // Also add a timeline notification that a volunteer responded
    await db.query(
      `INSERT INTO rescue_updates (report_id, author_id, event_type, description)
       VALUES ($1, $2, 'Volunteer Responded', $3);`,
      [id, volunteerId, `${req.session.user.name} offered assistance: ${help_type}.`]
    );

    return res.status(201).json({
      message: 'Assistance offer submitted successfully',
      offer: insertRes.rows[0],
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Retrieve volunteer offers for a report (GET /api/reports/:id/offers)
 * Restricted to report creator and Admin to protect volunteer contact details.
 */
async function getReportOffers(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.session.user.id;
    const userRole = req.session.user.role;

    const reportRes = await db.query('SELECT reporter_id FROM rescue_reports WHERE id = $1;', [id]);
    if (reportRes.rows.length === 0) {
      return res.status(404).json({ error: 'Rescue report not found.' });
    }

    if (reportRes.rows[0].reporter_id !== userId && userRole !== 'ADMIN') {
      return res.status(403).json({
        error: 'Access forbidden. Only the report creator or administrator can view incoming assistance offers.',
      });
    }

    const query = `
      SELECT 
        h.id,
        h.report_id,
        h.volunteer_id,
        u.name AS volunteer_name,
        u.email AS volunteer_email,
        u.phone AS volunteer_phone,
        u.area AS volunteer_area,
        h.help_type,
        h.message,
        h.status,
        h.created_at
      FROM help_offers h
      JOIN users u ON h.volunteer_id = u.id
      WHERE h.report_id = $1
      ORDER BY h.created_at DESC;
    `;

    const result = await db.query(query, [id]);
    return res.json({ offers: result.rows });
  } catch (err) {
    next(err);
  }
}

/**
 * Update status of an assistance offer (PATCH /api/reports/:id/offers/:offerId/status)
 * Allows reporter or Admin to accept / decline / complete an offer.
 */
async function updateOfferStatus(req, res, next) {
  try {
    const { id, offerId } = req.params;
    const { status } = req.body;
    const userId = req.session.user.id;
    const userRole = req.session.user.role;

    const reportRes = await db.query('SELECT reporter_id FROM rescue_reports WHERE id = $1;', [id]);
    if (reportRes.rows.length === 0) {
      return res.status(404).json({ error: 'Rescue report not found.' });
    }

    if (reportRes.rows[0].reporter_id !== userId && userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Access forbidden. Only the report creator or administrator can manage offers.' });
    }

    const offerRes = await db.query(
      `UPDATE help_offers
       SET status = $1
       WHERE id = $2 AND report_id = $3
       RETURNING *;`,
      [status, offerId, id]
    );

    if (offerRes.rows.length === 0) {
      return res.status(404).json({ error: 'Assistance offer not found.' });
    }

    return res.json({
      message: `Offer status updated to ${status}`,
      offer: offerRes.rows[0],
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createReport,
  getAllReports,
  getReportById,
  updateReport,
  updateReportStatus,
  addTimelineUpdate,
  getTimelineUpdates,
  createHelpOffer,
  getReportOffers,
  updateOfferStatus,
};
