const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload.middleware');
const { requireAuth } = require('../middleware/auth.middleware');

router.post('/', requireAuth, (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File size exceeds maximum allowed limit of 5MB.' });
      }
      return res.status(400).json({ error: err.message || 'Error uploading file.' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Please select an image file to upload.' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    return res.status(201).json({
      message: 'Image uploaded successfully',
      imageUrl,
      filename: req.file.filename,
    });
  });
});

module.exports = router;
