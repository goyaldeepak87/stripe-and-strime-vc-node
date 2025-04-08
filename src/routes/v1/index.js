const express = require('express');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
// const docsRoute = require('./docs.route');
const config = require('../../config/config');
const agoraRoute = require('./agora.route');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/user',
    route: userRoute,
  },
  {
    path: '/agora',
    route: agoraRoute,
  },
];

if (config.nodeEnv == 'development') {
  defaultRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
} else if (config.nodeEnv == 'production') {
  defaultRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
} else if (config.nodeEnv == 'staging') {
  defaultRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}else{
  defaultRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}


module.exports = router;