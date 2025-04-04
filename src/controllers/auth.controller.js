const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { userService, authService, tokenService, guestTokenService } = require('../services');
const { generateAuthTokens } = require('../services/token.service');
const userMessages = require('../messages/userMessages');

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

const guestUserLogin = catchAsync(async (req, res) => {
    const user = await userService.createGuestUser(req.body);
    console.log("ussdsader", user.guestUser.uuid)
    const token = await guestTokenService.generateAuthTokens(user.guestUser)
    res.sendJSONResponse({
        statusCode: httpStatus.OK,
        status: true,
        message: userMessages.LOGIN_SUCCESS,
        data: { result: { user, token } },
    });
});

module.exports = {
    register,
    login,
    resetPassword,
    deleteProfile,
    guestUserLogin
};