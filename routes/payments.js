const express = require('express');
const { verifyBVN } = require('../controllers/paymentControllers');
const { isAuthenticated } = require('../middlewares/auth');

const router = express.Router();

router.route('/bvn/verify').post(isAuthenticated, verifyBVN);

module.exports = router