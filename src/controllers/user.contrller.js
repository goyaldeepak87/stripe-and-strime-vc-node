const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { tokenTypes } = require('../config/tokens');
const { tokenService, fileService } = require('../services');
const { Token, User } = require('../models');
const { userService } = require('../services');
const userMessages = require('../messages/userMessages');
const stripe = require('stripe')("sk_test_51RAcYq4ZzInBLDgLVbhN9KiSvJuwtB5wNReTvYeoKU4RKuwDQfFEqwiu85v9SPSXvgAXsXyoU3UQQc1QVI6NthRd00koPNZBri");

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
    const { uuid, id, title, price, prodectId } = req.body;
    const lineitems = [
        {
            price_data: {
                currency: 'usd',
                product_data: {
                    name: 'T-shirt',
                    // images: ['https://example.com/t-shirt.png'],
                },
                unit_amount: price*100,
            },
            quantity: 1,
        },
    ];
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineitems,
        mode: 'payment',
        success_url: `http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `http://localhost:3000/cancel`,
        metadata: {
            uuid,           // Unique identifier for the product
            productId: prodectId,  // Product ID
            title,          // Product title
            customId: id    // Custom ID
        },
    });
    console.log("session", session)
    res.json({ id: session.id });
    // res.sendJSONResponse({
    //     statusCode: httpStatus.OK,
    //     status: true,
    //     message: userMessages.USER_PROFILE_UPDATAED,
    //     data: { result: { session } },
    // });
})


const successPayment = catchAsync(async (req, res) => {
    const sessionId = req.query.session_id;
    console.log("sessionId", sessionId)

    if (!sessionId) {
        return res.status(httpStatus.BAD_REQUEST).json({
            message: 'Session ID is required.',
        });
    }

    // Retrieve session data from Stripe using the session_id
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
        return res.status(httpStatus.NOT_FOUND).json({
            message: 'Session not found.',
        });
    }

    // Assuming you stored the user ID as `client_reference_id` during checkout
    const { uuid, productId, title, customId } = session.metadata;
    const userId = uuid; // Set this in the checkout session as user ID
    const amountPaid = session.amount_total/100; // Convert from cents to dollars
    console.log("userId==?",amountPaid, session, userId)
    // const stripeSessionId = session.id;

    // // You can also retrieve product information if needed
    // const productInfo = session.line_items;

    // Save payment information to the database
    // const payment = await Payment.create({
    //     user_id: userId,
    //     amount_paid: amountPaid,
    //     payment_status: 'completed',
    //     stripe_session_id: stripeSessionId,
    //     product_info: JSON.stringify(productInfo), // Store the product info as JSON
    // });

    // console.log('Payment recorded successfully:', payment);

    // Respond with success message and details
    res.sendJSONResponse({
        statusCode: httpStatus.OK,
        status: true,
        message: 'Payment completed successfully.',
        data: { result: {  } },
    });
});

module.exports = {
    userProfile,
    userUpadteProfile,
    createCheckoutSession,
    successPayment,
}