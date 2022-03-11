const express = require('express');
const { verifyBVN, addCard, getTransactionStatus } = require('../controllers/paymentControllers');
const { isAuthenticated } = require('../middlewares/auth');

const router = express.Router();

router.route('/bvn/verify').post(isAuthenticated, verifyBVN);
router.route('/transaction/status').post(isAuthenticated, getTransactionStatus);
router.route('/user/add-card').post(isAuthenticated, addCard);

module.exports = router