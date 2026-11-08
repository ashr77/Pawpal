const bcrypt = require('bcrypt');
const db = require('../config/db');

async function register(req, res, next) {
  try {
    const { name, email, password, phone, area } = req.body;

    const existing = await db.query('SELECT id FROM users WHERE LOWER(email) = LOWER($1);', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'An account with this email address already exists.' });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const result = await db.query(
      `INSERT INTO users (name, email, password_hash, phone, area, role)
       VALUES ($1, LOWER($2), $3, $4, $5, 'USER')
       RETURNING id, name, email, phone, area, role, created_at;`,
      [name, email, passwordHash, phone || '', area || '']
    );

    const newUser = result.rows[0];

    // Establish session
    req.session.user = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      phone: newUser.phone,
      area: newUser.area,
    };

    return res.status(201).json({
      message: 'Registration successful',
      user: req.session.user,
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const result = await db.query(
      'SELECT id, name, email, password_hash, phone, area, role FROM users WHERE LOWER(email) = LOWER($1);',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      area: user.area,
    };

    return res.json({
      message: 'Login successful',
      user: req.session.user,
    });
  } catch (err) {
    next(err);
  }
}

function logout(req, res) {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Could not log out at this time.' });
    }
    res.clearCookie('pawpal.sid');
    res.clearCookie('connect.sid');
    return res.json({ message: 'Logged out successfully.' });
  });
}

async function getMe(req, res, next) {
  try {
    if (!req.session || !req.session.user) {
      return res.json({ user: null });
    }

    const result = await db.query(
      'SELECT id, name, email, phone, area, role, created_at FROM users WHERE id = $1;',
      [req.session.user.id]
    );

    if (result.rows.length === 0) {
      req.session.destroy();
      return res.json({ user: null });
    }

    const user = result.rows[0];
    req.session.user = user;
    return res.json({ user });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  login,
  logout,
  getMe,
};
