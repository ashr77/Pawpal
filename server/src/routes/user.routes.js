const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { profileUpdateSchema, changePasswordSchema } = require('../validators/auth.validator');

router.get('/me', requireAuth, userController.getProfile);
router.patch('/me', requireAuth, validate(profileUpdateSchema), userController.updateProfile);
router.patch('/me/password', requireAuth, validate(changePasswordSchema), userController.changePassword);

module.exports = router;
