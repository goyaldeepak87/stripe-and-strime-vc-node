const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { tokenTypes } = require('../config/tokens');
const { tokenService, fileService } = require('../services');
const { Token, User } = require('../models');
const { userService } = require('../services');
const userMessages = require('../messages/userMessages');
const stripe = require('stripe')("sk_test_51R9ONz2aFywf1JUEgc6yDNswm4pzy2rROt0H55lqmoWMmjpYynAhFOi4fUemOKOYo7KG5TukTXucsPuRFFUDg9au0033Vbf48w");

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
    // console.log("req.body", req.body)
    // const  product_data  = req.body;
    const line_items = [ 
        {
            price_data: {
                currency: 'usd',
                product_data: {
                    name: 'T-shirt',
                    // images: ['https://example.com/t-shirt.png'],
                },
                unit_amount: 2000,
            },
            quantity: 1,
        },
    ];
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items,
        mode: 'payment',
        success_url: `http://localhost:3000/success`,
        cancel_url: `http://localhost:3000/cancel`,
    });
    res.sendJSONResponse({
        statusCode: httpStatus.OK,
        status: true,
        message: userMessages.USER_PROFILE_UPDATAED,
        data: { result: { session } },
    });
})

module.exports = {
    userProfile,
    userUpadteProfile,
    createCheckoutSession,
}