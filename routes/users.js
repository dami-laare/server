const express = require('express');
const { registerUser, verifyOTP, addPin, loginUser, logoutUser} = require('../controllers/authControllers');
const { verifyBVN } = require('../controllers/paymentControllers');
const { isAuthenticated, isAuthorized } = require('../middlewares/auth');

const router = express.Router();

router.route('/user/register').post(registerUser);
router.route('/otp/verify').post(isAuthenticated, verifyOTP);
router.route('/user/pin/new').put(isAuthenticated, addPin);
router.route('/user/login').post(loginUser)
router.route('/user/logout').post(logoutUser)


module.exports = router;