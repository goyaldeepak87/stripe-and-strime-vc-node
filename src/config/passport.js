const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const config = require('./config');
const { tokenTypes } = require('./tokens');
const { User, GuestUser } = require('../models');

const jwtOptions = {
  secretOrKey: config.jwt.secret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

const jwtVerify = async (payload, done) => {
  try {
    let user = null;

    // Check token type and verify against the appropriate table
    if (payload.type === tokenTypes.ACCESS) {
      user = await User.findOne({ where: { uuid: payload.sub } });
    } else if (payload.type === tokenTypes.GUESTACCESS) {
      user = await GuestUser.findOne({ where: { uuid: payload.sub } });
    } else {
      throw new Error('Invalid token type');
    }

    if (!user) {
      return done(null, false);
    }
    done(null, user);
  } catch (error) {
    done(error, false);
  }
};

const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify);

module.exports = {
  jwtStrategy,
};
