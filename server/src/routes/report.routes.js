const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { createReportSchema } = require('../validators/report.validator');

router.post('/', requireAuth, validate(createReportSchema), reportController.createReport);
router.get('/', reportController.getAllReports);
router.get('/:id', reportController.getReportById);

module.exports = router;
