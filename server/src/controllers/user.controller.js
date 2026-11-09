const bcrypt = require('bcrypt');
const db = require('../config/db');

async function getProfile(req, res, next) {
  try {
    const result = await db.query(
      'SELECT id, name, email, phone, area, role, created_at, updated_at FROM users WHERE id = $1;',
      [req.session.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    return res.json({ profile: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const { name, phone, area } = req.body;
    const userId = req.session.user.id;

    const result = await db.query(
      `UPDATE users 
       SET 
         name = COALESCE($1, name),
         phone = COALESCE($2, phone),
         area = COALESCE($3, area),
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING id, name, email, phone, area, role, updated_at;`,
      [name, phone, area, userId]
    );

    const updated = result.rows[0];
    req.session.user = {
      ...req.session.user,
      name: updated.name,
      phone: updated.phone,
      area: updated.area,
    };

    return res.json({
      message: 'Profile updated successfully',
      user: req.session.user,
    });
  } catch (err) {
    next(err);
  }
}

async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.session.user.id;

    const userRes = await db.query(
      'SELECT password_hash FROM users WHERE id = $1;',
      [userId]
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, userRes.rows[0].password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect.' });
    }

    const saltRounds = 10;
    const newHash = await bcrypt.hash(newPassword, saltRounds);

    await db.query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2;',
      [newHash, userId]
    );

    return res.json({ message: 'Password updated successfully.' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
};
