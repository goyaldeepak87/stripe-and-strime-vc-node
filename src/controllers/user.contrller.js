const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { tokenTypes } = require('../config/tokens');
const { tokenService, fileService } = require('../services');
const { Token, User } = require('../models');
const { userService } = require('../services');
const userMessages = require('../messages/userMessages');

const userProfile = catchAsync(async (req, res) => {
    const token = req.headers.authorization;
    const userID = await tokenService.verifyTokenUserId(token, tokenTypes.RESET_PASSWORD);

    const tokenData = await Token.findOne({
        where: { user_uuid: userID.sub },
        include: {
            model: User,
            // as: 'user',  // Alias for association (optional, can be left out)
            // attributes: [], // Only get necessary fields from the user
        }
    })
    res.sendJSONResponse({
        statusCode: httpStatus.OK,
        status: true,
        message: userMessages.USER_DATA_FEATCH,
        data: { result: tokenData.User },
    });
})

const userUpadteProfile = catchAsync(async (req, res) => {
    const token = req.headers.authorization;
    const userID = await tokenService.verifyTokenUserId(token);
    const user = await userService.userProfileUpdate(req, userID)
    res.sendJSONResponse({
        statusCode: httpStatus.OK,
        status: true,
        message: userMessages.USER_PROFILE_UPDATAED,
        data: { result: { user } },
    });
})


const createCheckoutSession = catchAsync(async (req, res) => {
    console.log("req.body", req.body)
    // const { line_items } = req.body;
    // const session = await stripe.checkout.sessions.create({
    //     payment_method_types: ['card'],
    //     line_items,
    //     mode: 'payment',
    //     success_url: `${req.headers.origin}/success`,
    //     cancel_url: `${req.headers.origin}/cancel`,
    // });
    // res.sendJSONResponse({
    //     statusCode: httpStatus.OK,
    //     status: true,
    //     message: userMessages.USER_PROFILE_UPDATAED,
    //     data: { result: { session } },
    // });
})

module.exports = {
    userProfile,
    userUpadteProfile,
    createCheckoutSession,
}