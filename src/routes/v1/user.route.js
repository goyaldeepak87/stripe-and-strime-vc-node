const express = require('express');
const validate = require('../../middlewares/validate');
const auth = require('../../middlewares/auth');
const authValidation = require('../../validations/auth.validation');
const userController = require('../../controllers/user.contrller');
const upload = require('../../config/uploadConfig');

const router = express.Router();

router.get("/profile", validate(authValidation.logoutSchoolUser), auth(), userController.userProfile)
router.post("/update-profile", auth(), upload.single('profile_picture'), userController.userUpadteProfile)



// Paymen Stripe
router.post("/api/checkout_sessions",auth(), userController.createCheckoutSession);
router.get("/api/payment_success", auth(), userController.successPayment);
router.get("/api/user_list", auth(), userController.userList);

module.exports = router;