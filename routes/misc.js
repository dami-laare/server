const express = require('express');
const router = express.Router();

const { isAuthenticated, isAuthorized } = require('../middlewares/auth');
const { generateInviteCode, validateInviteCode,  generateMealTicket, verifyUser,   } = require('../controllers/miscControllers');


router.route('/admin/generate').get(generateInviteCode);
router.route('/admin/verify').post(verifyUser);
router.route('/ticket').post(isAuthenticated, generateMealTicket);
router.route('/invite/validate/:inviteCode').post(validateInviteCode);


module.exports = router;
