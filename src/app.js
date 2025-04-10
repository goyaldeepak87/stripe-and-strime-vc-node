const express = require('express');
const http = require('http');
const cors = require('cors');
const routes = require('./routes/v1');
const { errorConverter, errorHandler } = require('./middlewares/error');
const db = require('./models');
const ApiError = require('./utils/ApiError');
const passport = require('passport');
const { jwtStrategy } = require('./config/passport');
const httpStatus = require('http-status');
const { Server } = require('socket.io');
const tokenRoutes = require('./routes/v1/tokenRoutes');

// Create the Express app
const app = express();

// Create the HTTP server with Express
const server = http.createServer(app);

// Configure CORS
app.use(cors());
app.options('*', cors());

// Serve static files (e.g., user images, files) to browser
app.use(express.static("./public"));

// Middleware
app.use(express.json());
app.use(passport.initialize());
passport.use('jwt', jwtStrategy);

// API routes
app.use('/v1', routes);
app.use('/api', tokenRoutes);

// Error handling middleware (must be after routes)
app.use(errorConverter);
app.use(errorHandler);

// 404 handler
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Load socket handlers (you will define these in a separate file)
require('./socket/socketHandlers')(io);

// Add a custom method for sending JSON responses
app.response.sendJSONResponse = function ({ statusCode, status = true, message, data, isShowMessage = true }) {
  return this.status(statusCode).json({ statusCode, status, message, isShowMessage, data });
};

// Synchronize the database
db.sequelize.sync();

// Export the app and server object for use in index.js
module.exports = server;
