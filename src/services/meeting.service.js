// meetingService.js
const { Op, Sequelize } = require('sequelize');
// const tokenService = require('../services/tokenService');
const { tokenService, fileService } = require('../services');
const { Token, User, GuestUser, Payment, Meeting } = require('../models');

const meetingService = {
  // Common function to verify token and get user ID
  getUserFromToken: async (token) => {
    if (!token || token === "undefined" || token === "null" || token.trim() === "") {
      return null;
    }

    try {
      return await tokenService.verifyTokenUserId(token);
    } catch (error) {
      console.error("Token verification failed:", error);
      return null;
    }
  },

  // Common query builder for meetings
  buildMeetingQuery: ({ userId = null, includePayments = false, onlyUnpaid = false, onlyPaidByUser = false }) => {
    const query = {
      include: [
        {
          model: GuestUser,
          attributes: ['uuid', 'name', 'email', 'role'],
        }
      ],
      order: [['scheduledFor', 'ASC']]
    };

    // Filter by user if provided
    if (userId) {
      query.where = { user_uuid: userId };
    }

    // Include payment information if requested
    if (includePayments || onlyUnpaid || onlyPaidByUser) {
      const paymentInclude = {
        model: Payment,
        attributes: ['id', 'payment_status'],
        required: onlyPaidByUser // Inner join only if we need meetings paid by this user
      };

      // Filter for payments by specific user
      if (onlyPaidByUser && userId) {
        paymentInclude.where = { guest_user_id: userId };
      }

      query.include.push(paymentInclude);
    }

    // Filter for meetings without any payments
    if (onlyUnpaid) {
      query.where = {
        ...(query.where || {}),
        id: {
          [Op.notIn]: Sequelize.literal(`(
            SELECT DISTINCT meeting_id FROM Payments
          )`)
        }
      };
    }

    return query;
  },

  NewCreatebuildMeetingQuery: ({
    userId = null,
    includePayments = false,
    includePaymentDetails = false,
    onlyUnpaid = false,
    onlyPaidByUser = false
  }) => {
    const query = {
      include: [
        {
          model: GuestUser,
          attributes: ['uuid', 'user_name', 'email', 'role'],
        }
      ],
      order: [['scheduledFor', 'ASC']]
    };

    // Filter by user if provided
    if (userId) {
      query.where = { user_uuid: userId };
    }

    // Include payment information if requested
    if (includePayments || onlyUnpaid || onlyPaidByUser || includePaymentDetails) {
      const paymentInclude = {
        model: Payment,
        attributes: ['id', 'payment_status', 'amount_paid', 'createdAt'],
        required: onlyPaidByUser // Inner join only if we need meetings paid by this user
      };

      // If we need detailed payment info, include the associated guest user data
      if (includePaymentDetails) {
        paymentInclude.include = [{
          model: GuestUser,
          as: 'paymentUser', // Define an alias to avoid confusion with the host
          attributes: ['uuid', 'user_name', 'email', 'role']
        }];
      }

      // Filter for payments by specific user
      if (onlyPaidByUser && userId) {
        paymentInclude.where = { guest_user_id: userId };
      }

      query.include.push(paymentInclude);
    }

    // Filter for meetings without any payments
    if (onlyUnpaid) {
      query.where = {
        ...(query.where || {}),
        id: {
          [Op.notIn]: Sequelize.literal(`(
            SELECT DISTINCT meeting_id FROM Payments
          )`)
        }
      };
    }

    return query;
  },

  // Process meeting results to add derived fields
  processMeetingResults: (meetings) => {
    return meetings.map(meeting => {
      const meetingData = meeting.toJSON();

      // Check if any payment exists for this meeting
      if (meetingData.Payments) {
        meetingData.hasPayment = meetingData.Payments.length > 0 &&
          meetingData.Payments.some(payment => payment.payment_status === 'paid');
        // Remove the payments array from the response
        delete meetingData.Payments;
      }

      return meetingData;
    });
  },


  NewCreateprocessMeetingResults: (meetings) => {
    return meetings.map(meeting => {
      const meetingData = meeting.toJSON();

      // Process payment information if it exists
      if (meetingData.Payments) {
        // Count paid bookings
        const paidBookings = meetingData.Payments.filter(
          payment => payment.payment_status === 'paid'
        );

        meetingData.totalBookings = paidBookings.length;
        meetingData.hasPayment = paidBookings.length > 0;

        // Format booking details
        meetingData.bookings = paidBookings.map(payment => {
          // Extract user info if available
          const userInfo = payment.paymentUser ? {
            uuid: payment.paymentUser.uuid,
            user_name: payment.paymentUser.user_name,
            email: payment.paymentUser.email,
            role: payment.paymentUser.role
          } : null;

          return {
            paymentId: payment.id,
            amountPaid: payment.amount_paid,
            paymentDate: payment.createdAt,
            attendee: userInfo
          };
        });

        // Remove the raw payments array from the response
        delete meetingData.Payments;
      } else {
        meetingData.totalBookings = 0;
        meetingData.hasPayment = false;
        meetingData.bookings = [];
      }

      return meetingData;
    });
  },

  // Generate unique room ID
  generateUniqueRoomId: (baseRoomId, userRole) => {
    const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${baseRoomId}-${userRole}-${randomString}`;
  }
};

module.exports = meetingService;