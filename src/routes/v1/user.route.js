const express = require('express');
// Middlewares
const validate = require('../../middlewares/validate');
const auth = require('../../middlewares/auth');
// Upload config
const upload = require('../../config/uploadConfig');
// Validations
const authValidation = require('../../validations/auth.validation');
const userValidation = require('../../validations/user.validation');
// Controllers
const userController = require('../../controllers/user.contrller');

// const { APP_ID, APP_CERTIFICATE } = require('../../config/config');
const { RtcTokenBuilder, RtcRole } = require('agora-access-token');

const APP_ID = `97ba91d7faa144a594f38f7453dc558e`;
const APP_CERTIFICATE = `9b7347368b9e40b397a5a3d048dbc3dd`;

const router = express.Router();

// Profile Routes
router.get("/profile", validate(authValidation.logoutSchoolUser), auth(), userController.userProfile)
router.post("/update-profile", auth(), upload.single('profile_picture'), userController.userUpadteProfile)


// create sessions host
router.post("/api/host/create_sessions",validate(userValidation.createMeeting), auth(), userController.createOrganizerSession);
router.get("/api/host/my_sessions", auth(), userController.mySessions);
router.get('/api/meetings', userController.getAllMeetings);
router.get('/api/my-booked-meetings', auth(), userController.myBookedMeetings);

// Stripe Payment Routes
router.post("/api/checkout_sessions",validate(userValidation.productDetails), auth(), userController.createCheckoutSession);
router.get("/api/payment_success", validate(userValidation.paymentSuccess),auth(), userController.successPayment);

module.exports = router;