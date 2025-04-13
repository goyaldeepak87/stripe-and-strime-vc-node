const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { tokenTypes } = require('../config/tokens');
const { tokenService, fileService } = require('../services');
const { Token, User, GuestUser, Payment, Meeting } = require('../models');
const { userService } = require('../services');
const userMessages = require('../messages/userMessages');
const { Op, Sequelize } = require('sequelize');
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
    const { uuid, id, title, price, meeting_id } = req.body;
    const lineitems = [
        {
            price_data: {
                currency: 'usd',
                product_data: {
                    name: title,
                    // images: ['https://example.com/t-shirt.png'],
                },
                unit_amount: price * 100,
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
            meeting_id,  // Product ID
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



const createOrganizerSession = catchAsync(async (req, res) => {
    const token = req.headers.authorization;
    const userID = await tokenService.verifyTokenUserId(token);

    // Extract meeting details from request body
    const { title, description, roomId, scheduledFor, hostName, price } = req.body;

    // Generate a random string (6 characters)
    const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Create a unique roomId by combining the original roomId, host name, and random string
    const uniqueRoomId = `${roomId}-${userID?.role}-${randomString}`;

    try {
        // Create a new meeting record
        const meeting = await Meeting.create({
            title,
            description,
            roomId: uniqueRoomId, // Use the unique roomId
            scheduledFor: new Date(scheduledFor),
            user_uuid: userID.sub, // Link the meeting to the user who created it
            price
        });

        // Respond with success message and the created meeting
        res.sendJSONResponse({
            statusCode: httpStatus.CREATED,
            status: true,
            message: 'Meeting session created successfully',
            data: {
                result: meeting,
                uniqueRoomId // Include the uniqueRoomId in the response
            },
        });
    } catch (error) {
        console.error("Error creating meeting:", error);
        res.sendJSONResponse({
            statusCode: httpStatus.INTERNAL_SERVER_ERROR,
            status: false,
            message: 'Failed to create meeting session',
            error: error.message,
        });
    }
});


const mySessions = catchAsync(async (req, res) => {
    const token = req.headers.authorization;
    const userID = await tokenService.verifyTokenUserId(token);
    
    // Get all meetings created by this host
    const meetings = await Meeting.findAll({
        where: { user_uuid: userID.sub },
        include: [
            {
                model: GuestUser,
                attributes: ['uuid', 'name', 'email', 'role'],
            },
            {
                model: Payment,
                attributes: ['id', 'payment_status'],
                required: false // Left join to include meetings without payments
            }
        ],
        order: [['scheduledFor', 'ASC']]
    });

    // Process the meetings to add payment status field
    const processedMeetings = meetings.map(meeting => {
        const meetingData = meeting.toJSON();
        
        // Check if any payment exists for this meeting
        meetingData.hasPayment = meetingData.Payments && 
                                meetingData.Payments.length > 0 &&
                                meetingData.Payments.some(payment => payment.payment_status === 'paid');
        
        // Remove the payments array from the response
        delete meetingData.Payments;
        
        return meetingData;
    });

    return res.sendJSONResponse({
        statusCode: 200,
        status: true,
        message: "Meetings fetched successfully",
        data: { meetings: processedMeetings },
    });
});

const getAllMeetings = catchAsync(async (req, res) => {
    const authHeader = req.headers.authorization;
    
    // Check for missing or invalid token
    if (!authHeader || authHeader === "undefined" || authHeader === "null" || authHeader.trim() === "") {
        console.log("No valid token found - showing meetings without payment records");
        
        // No token case - show only meetings that don't have any payment records
        const meetings = await Meeting.findAll({
            where: {
                id: {
                    [Op.notIn]: Sequelize.literal(`(
                        SELECT DISTINCT meeting_id FROM Payments
                    )`)
                }
            },
            include: [
                {
                    model: GuestUser,
                    attributes: ['uuid', 'name', 'email', 'role'],
                }
            ],
            order: [['scheduledFor', 'ASC']]
        });

        return res.sendJSONResponse({
            statusCode: 200,
            status: true,
            message: "All available meetings fetched successfully",
            data: { meetings },
        });
    } 
    
    // Token exists, verify and filter meetings
    try {
        const userID = await tokenService.verifyTokenUserId(authHeader);
        console.log("User authenticated with ID:", userID.sub);
        
        // Find all meetings EXCEPT:
        // 1. Those belonging to the current user
        // 2. Those that ANY user has already paid for
        const meetings = await Meeting.findAll({
            where: {
                // Not the current user's meetings
                user_uuid: {
                    [Op.ne]: userID.sub
                },
                // Exclude meetings that ANY user has paid for
                id: {
                    [Op.notIn]: Sequelize.literal(`(
                        SELECT DISTINCT meeting_id FROM Payments
                    )`)
                }
            },
            include: [
                {
                    model: GuestUser,
                    attributes: ['uuid', 'name', 'email', 'role'],
                }
            ],
            order: [['scheduledFor', 'ASC']]
        });
        
        return res.sendJSONResponse({
            statusCode: 200,
            status: true,
            message: "All available meetings fetched successfully",
            data: { meetings },
        });
    } catch (error) {
        console.error("Token verification failed:", error);
        
        // If token verification fails, treat it as a no-token scenario
        const meetings = await Meeting.findAll({
            where: {
                id: {
                    [Op.notIn]: Sequelize.literal(`(
                        SELECT DISTINCT meeting_id FROM Payments
                    )`)
                }
            },
            include: [
                {
                    model: GuestUser,
                    attributes: ['uuid', 'name', 'email', 'role'],
                }
            ],
            order: [['scheduledFor', 'ASC']]
        });

        return res.sendJSONResponse({
            statusCode: 200,
            status: true,
            message: "All available meetings fetched successfully (auth failed)",
            data: { meetings },
        });
    }
});

const myBookedMeetings = catchAsync(async (req, res) => {
    const token = req.headers.authorization;
    const userID = await tokenService.verifyTokenUserId(token);
    
    // Find all meetings that the current user has paid for
    const bookedMeetings = await Meeting.findAll({
        include: [
            {
                model: GuestUser,
                attributes: ['uuid', 'name', 'email', 'role'],
            },
            {
                model: Payment,
                required: true, // This ensures only meetings with payments are included
                where: {
                    guest_user_id: userID.sub // Only include payments made by the current user
                }
            }
        ],
        order: [['scheduledFor', 'ASC']] // Order by upcoming meetings first
    });
    
    return res.sendJSONResponse({
        statusCode: 200,
        status: true,
        message: "Your booked meetings fetched successfully",
        data: { bookedMeetings },
    });
});

const successPayment = catchAsync(async (req, res) => {
    const sessionId = req.query.session_id;
    console.log("sessionId", sessionId);

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
    const { uuid, productId, title, customId, meeting_id } = session.metadata;
    const userId = uuid; // Set this in the checkout session as user ID
    const amountPaid = session.amount_total / 100; // Convert from cents to dollars
    const stripeSessionId = session.id;

    // Check if the payment already exists in the database
    const existingPayment = await Payment.findOne({
        where: {
            stripe_session_id: stripeSessionId, // Check by Stripe session ID
        },
    });

    if (existingPayment) {
        return res.sendJSONResponse({
            statusCode: httpStatus.OK,
            status: true,
            message: 'Payment already recorded.',
            data: { result: existingPayment },
        });
    }

    // Save payment information to the database
    const payment = await Payment.create({
        guest_user_id: userId,
        amount_paid: amountPaid,
        stripe_session_id: stripeSessionId,
        payment_status: 'paid',
        meeting_id: meeting_id, // Store product info as JSON
    });

    await GuestUser.update(
        { payment_status: 'paid' }, // Update the payment_status field
        { where: { uuid: userId } } // Match the user by UUID
    );

    // Respond with success message and details
    res.sendJSONResponse({
        statusCode: httpStatus.OK,
        status: true,
        message: 'Payment completed successfully.',
        data: { result: payment },
    });
});


module.exports = {
    userProfile,
    userUpadteProfile,
    createCheckoutSession,
    successPayment,
    createOrganizerSession,
    mySessions,
    getAllMeetings,
    myBookedMeetings
}