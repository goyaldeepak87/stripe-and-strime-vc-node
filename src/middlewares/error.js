const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
// const logger = require('../config/logger'); // Make sure you have a logger configured

const errorConverter = (err, req, res, next) => {
    // console.log('Error Converter Triggered:==>', err, next);
    
    let error = err;
    if (!(error instanceof ApiError)) {
        const statusCode = error.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
        const message = error.message || httpStatus[statusCode];
        error = new ApiError(statusCode, message, false, err.stack);
    }
    
    // Log the error details
    console.log('Converted Error:', {
        statusCode: error.statusCode,
        message: error.message,
        stack: error.stack
    });
    
    next(error);
};

const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        status: 'error',
        statusCode,
        message: err.message
    });
};

module.exports = {
    errorConverter,
    errorHandler
};
