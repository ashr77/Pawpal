const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const {
  createReportSchema,
  updateReportSchema,
  updateStatusSchema,
  createTimelineUpdateSchema,
  createHelpOfferSchema,
  updateOfferStatusSchema,
} = require('../validators/report.validator');

// 1. Report CRUD
router.post('/', requireAuth, validate(createReportSchema), reportController.createReport);
router.get('/', reportController.getAllReports);
router.get('/:id', reportController.getReportById);
router.patch('/:id', requireAuth, validate(updateReportSchema), reportController.updateReport);
router.patch('/:id/status', requireAuth, validate(updateStatusSchema), reportController.updateReportStatus);

// 2. Rescue Progress Timeline
router.post('/:id/updates', requireAuth, validate(createTimelineUpdateSchema), reportController.addTimelineUpdate);
router.get('/:id/updates', reportController.getTimelineUpdates);

// 3. Volunteer Assistance Coordination
router.post('/:id/offers', requireAuth, validate(createHelpOfferSchema), reportController.createHelpOffer);
router.get('/:id/offers', requireAuth, reportController.getReportOffers);
router.patch('/:id/offers/:offerId/status', requireAuth, validate(updateOfferStatusSchema), reportController.updateOfferStatus);

module.exports = router;
