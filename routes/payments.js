const express = require('express');
const { verifyBVN, addCard } = require('../controllers/paymentControllers');
const { isAuthenticated } = require('../middlewares/auth');

const router = express.Router();

router.route('/bvn/verify').post(isAuthenticated, verifyBVN);
router.route('/user/add-card').post(isAuthenticated, addCard);

module.exports = router