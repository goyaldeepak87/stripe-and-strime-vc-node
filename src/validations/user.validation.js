const Joi = require('joi');
const { password, objectId } = require('./custom.validation');

const createUser = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    name: Joi.string().required(),
    role: Joi.string().required().valid('user', 'admin'),
  }),
};

const getUsers = {
  query: Joi.object().keys({
    name: Joi.string(),
    role: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

const updateUser = {
  params: Joi.object().keys({
    userId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      email: Joi.string().email(),
      password: Joi.string().custom(password),
      name: Joi.string(),
    })
    .min(1),
};

const deleteUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};



const registerEmail = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
  }),
  // query: Joi.object().keys({
  //   role: Joi.string().required(),
  // }),
};

const productDetails = {
  body: Joi.object().keys({
    active: Joi.boolean().required(),
    id: Joi.number().integer().required(),
    price: Joi.number().required(),
    meeting_id: Joi.number().integer().required(),
    title: Joi.string().required(),
    uuid: Joi.string().guid({
      version: [
        'uuidv4'
      ]
    }).required()
  }),
};

const paymentSuccess = {
  query: Joi.object().keys({
    session_id: Joi.string().required()
  }),
};


const userHeaderCheck = {
  headers: Joi.object().keys({
    deviceid: Joi.string().required(),
    devicetype: Joi.string().required(),
    devicename: Joi.string().required(),
    ipaddress: Joi.string()
      .required()
      .custom((value, helpers) => {
        if (value === "14.194.97.171") {
          return helpers.message('This IP address is not allowed');
        }
        return value;
      })
      .messages({
        'any.required': 'ipAddress is required.',
        'any.invalid': 'Invalid ipAddress.',
      }),
    authorization: Joi.string()
      .required()
      .custom((value, helpers) => {
        if (value.split(" ")[0] !== "Bearer") {
          return helpers.message('Bearer JWT Allow');
        }
        return value;
      })
      .messages({
        'any.required': 'Bearer Token is required.',
        'any.invalid': 'Invalid Bearer Token.',
      }),
  }).unknown(true),
};

const createMeeting = {
  body: Joi.object().keys({
    title: Joi.string().required(),
    description: Joi.string().allow('').optional(),
    scheduledFor: Joi.date().iso().required(),
    roomId: Joi.string().required(),
    price: Joi.string().required(),
  }),
};

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  registerEmail,
  userHeaderCheck,
  productDetails,
  paymentSuccess,
  createMeeting
};
