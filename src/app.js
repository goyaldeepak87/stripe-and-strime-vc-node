const express = require('express');
const cors = require('cors');
const routes = require('./routes/v1');
const { errorConverter, errorHandler } = require('./middlewares/error');
const db = require('./models');
const ApiError = require('./utils/ApiError');
const passport = require('passport')
const { jwtStrategy } = require('./config/passport');
const httpStatus = require('http-status');
// require('./config/cronJobs'); 

const app = express();

// Serve static files (e.g., user images, files) to browser
app.use(express.static("./public"));

// Middleware
app.use(express.json());
app.use(cors());
app.options('*', cors());

// Routes
app.use('/v1', routes);

// Error handling middleware (must be after routes)
app.use(errorConverter);
app.use(errorHandler);

app.use(passport.initialize());
passport.use('jwt', jwtStrategy);

// 404 handler
app.use((req, res, next) => {
    next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});


app.response.sendJSONResponse = function ({ statusCode, status = true, message, data, isShowMessage = true }) {
    // let exceptionError;
    // if ('exception' in data) {
    //   exceptionError = 'exception' in data ? data.exception : undefined;
    //   delete data.exception;
    // }
    //   console.log(`code, status, message, isShowMessage, data`, code, status, message, isShowMessage, data)

    return this.status(statusCode).json({ statusCode, status, message, isShowMessage, data });
};

db.sequelize.sync()
// // Unhandled error handler
// process.on('unhandledRejection', (error) => {
//     console.log('Unhandled Rejection:', error);
// });

module.exports = app;