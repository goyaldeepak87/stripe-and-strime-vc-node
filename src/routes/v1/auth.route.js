const express = require('express');
const validate = require('../../middlewares/validate');
const authValidation = require('../../validations/auth.validation');
const authController = require('../../controllers/auth.controller');
const auth = require('../../middlewares/auth');

const router = express.Router();


router.post('/superadmin/register', validate(authValidation.registerSuperAdimn), authController.register);

router.post('/superadmin/login', validate(authValidation.loginSuperAdiman), authController.login);

router.post('/superadmin/change-password', validate(authValidation.resetPassword), auth(), authController.resetPassword)

router.post('/user-delete', auth(), authController.deleteProfile)


// Guest user

router.post('/guest-user/login', validate(authValidation.guestUserLogin), authController.guestUserLogin);

module.exports = router;