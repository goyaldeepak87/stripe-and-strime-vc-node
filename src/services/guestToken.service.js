const jwt = require('jsonwebtoken');
const moment = require('moment');
const httpStatus = require('http-status');
const config = require('../config/config');
const userService = require('./user.service');
const { GuestToken } = require('../models');
const ApiError = require('../utils/ApiError');
const { tokenTypes } = require('../config/tokens');


const generateToken = (userId, name, expires, type, secret = config.jwt.secret) => {
  const payload = {
    sub: userId,
    name: name,
    iat: moment().unix(),
    exp: expires.unix(),
    type,
  };
  return jwt.sign(payload, secret);
};

const generateAuthTokens = async (user) => {

  console.log("user==?9849879", user.uuid, user.name)

  const accessTokenExpires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');
  const accessToken = generateToken(user.uuid, user.name, accessTokenExpires, tokenTypes.ACCESS);

  const refreshTokenExpires = moment().add(config.jwt.refreshExpirationDays, 'days');
  const refreshToken = generateToken(user.uuid, user.name, refreshTokenExpires, tokenTypes.REFRESH);
console.log("refreshToken==?984987sss9", refreshToken,accessToken)
  await GuestToken.create({
    token: refreshToken,
    user_uuid: user.uuid,
    type: 'auth',
    expires: new Date(new Date().getTime() + 3600000)
  });

  return {
    access: {
      token: accessToken,
      expires: accessTokenExpires.toDate(),
    },
    refresh: {
      token: refreshToken,
      expires: refreshTokenExpires.toDate(),
    },
  };
};


const verifyToken = async (token, type) => {
  let BearerToken = token.split("Bearer")[1].trim()
  const payload = jwt.verify(BearerToken, config.jwt.secret);
  const tokenDoc = await GuestToken.findOne({ where: { user_uuid: payload.sub } });
  if (!tokenDoc) {
    throw new Error('Token not found');
  }
  return tokenDoc;
};


const verifyTokenUserId = async (token) => {
  let BearerToken = token.split("Bearer")[1].trim()
  const payload = jwt.verify(BearerToken, config.jwt.secret);
  return payload;
};


module.exports = {
  // generateToken,
  // saveToken,
  verifyToken,
  generateAuthTokens,
  verifyTokenUserId,
  // generateResetPasswordToken,
  // generateVerifyEmailToken,
};
