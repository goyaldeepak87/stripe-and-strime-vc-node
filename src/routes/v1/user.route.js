const express = require('express');
const validate = require('../../middlewares/validate');
const auth = require('../../middlewares/auth');
const authValidation = require('../../validations/auth.validation');
const userController = require('../../controllers/user.contrller');
const upload = require('../../config/uploadConfig');
// const { APP_ID, APP_CERTIFICATE } = require('../../config/config');
const { RtcTokenBuilder, RtcRole } = require('agora-access-token');

const APP_ID = `97ba91d7faa144a594f38f7453dc558e`;
const APP_CERTIFICATE = `9b7347368b9e40b397a5a3d048dbc3dd`;

const router = express.Router();

router.get("/profile", validate(authValidation.logoutSchoolUser), auth(), userController.userProfile)
router.post("/update-profile", auth(), upload.single('profile_picture'), userController.userUpadteProfile)



// Paymen Stripe
router.post("/api/checkout_sessions",auth(), userController.createCheckoutSession);
router.get("/api/payment_success", auth(), userController.successPayment);
router.get("/api/user_list", auth(), userController.userList);

module.exports = router;