const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { userService, authService, tokenService, guestTokenService } = require('../services');
const { generateAuthTokens } = require('../services/token.service');
const userMessages = require('../messages/userMessages');
const { sendVerificationEmail } = require('../services/email.service');

const register = catchAsync(async (req, res) => {
    const user = await userService.createUser(req.body);
    res.sendJSONResponse({
        statusCode: httpStatus.CREATED,
        status: true,
        message: userMessages.USER_REGISTER,
        data: { result: user },
    });
});


const login = catchAsync(async (req, res) => {
    const { email, password } = req.body
    const user = await authService.loginUserWithEmailAndPassword(email, password);
    const token = await generateAuthTokens(user)
    res.sendJSONResponse({
        statusCode: httpStatus.OK,
        status: true,
        message: userMessages.LOGIN_SUCCESS,
        data: { result: { user, token } },
    });
});

const resetPassword = catchAsync(async (req, res) => {
    const userResetPassword = await authService.resetPassword(req.headers.authorization, req.body);
    res.sendJSONResponse({
        statusCode: httpStatus.OK,
        status: true,
        message: userMessages.RESET_PASSWORD,
        data: { result: { userResetPassword } },
    });
})

const deleteProfile = async (req, res) => {
    try {
        const token = req.headers.authorization;
        const userID = await tokenService.verifyTokenUserId(token);
        await authService.deleteUserProfile(userID.sub);
        res.sendJSONResponse({
            statusCode: httpStatus.OK,
            status: true,
            message: userMessages.DELETE_USER,
            data: { result: {} },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



// Guest user

// const guestUserLogin = catchAsync(async (req, res) => {
//     console.log(req.body);

//     // Create guest user
//     const user = await userService.createGuestUser(req.body);
//     // const guestUser = user?.guestUser;

//     // // Extract and format username
//     // const emailPrefix = guestUser?.email?.split("@")[0];
//     // const username = emailPrefix
//     //     ? emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1)
//     //     : 'Guest';

//     // // Create role string
//     // const role = `${username}_${guestUser?.role}`;

//     // console.log(user, role);

//     // // Generate token
//     // const token = await guestTokenService.generateAuthTokens(guestUser, role);

//     // // Send response
//     // res.sendJSONResponse({
//     //     statusCode: httpStatus.OK,
//     //     status: true,
//     //     message: userMessages.LOGIN_SUCCESS,
//     //     data: { result: { user, token } },
//     // });
// });


const guestUserLogin = catchAsync(async (req, res) => {
    const { email, password } = req.body
    const user = await authService.loginGuestUserWithEmailAndPassword(email, password);
    const guestUser = user;
    const role = user?.role

    // // Generate token
    const token = await guestTokenService.generateAuthTokens(guestUser, role);

    // Send response
    res.sendJSONResponse({
        statusCode: httpStatus.OK,
        status: true,
        message: userMessages.LOGIN_SUCCESS,
        data: { result: { user, token } },
    });
});


const guestUserRegiter = catchAsync(async (req, res) => {
    const user = await userService.createGuestUser(req.body);
    await sendVerificationEmail(user.guestUser.email, user.guestUser.uuid);
    res.sendJSONResponse({
        statusCode: httpStatus.CREATED,
        status: true,
        message: userMessages.USER_REGISTER,
        data: { result: user },
    });
})

const guestUserRegiterEmailVerify = catchAsync(async (req, res) => {
    const userId = req.query;
    const user = await userService.RegiterEmailVerifyGuestUser(userId);
    if (!user) {
        return res.status(400).json({ message: 'Invalid or expired verification token' });
    }
    await userService.GuestUserEmailVerifyUpdate(userId);
    res.sendJSONResponse({
        statusCode: httpStatus.CREATED,
        status: true,
        message: userMessages.USER_EMAIL_VERIFY,
        data: { },
    });
})


module.exports = {
    register,
    login,
    resetPassword,
    deleteProfile,
    guestUserLogin,
    guestUserRegiter,
    guestUserRegiterEmailVerify
};