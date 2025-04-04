const Joi = require('joi');
const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');

const validate = (schema) => (req, res, next) => {
  const validSchema = pick(schema, ['params', 'query', 'body', 'headers']);
  const object = pick(req, Object.keys(validSchema));
  const { value, error } = Joi.compile(validSchema)
    .prefs({ errors: { label: 'key' }, abortEarly: false })
    .validate(object);

  if (error) {
    const errorMessage = error.details.map((details) => details.message).join(', ');
    return next(new ApiError(httpStatus.BAD_REQUEST, errorMessage));
  }
  
  Object.assign(req, value);
  return next();
};

module.exports = validate;




// const Joi = require('joi');
// const httpStatus = require('http-status');
// const pick = require('../utils/pick');
// const ApiError = require('../utils/ApiError');

// const validate = (schema) => (req, res, next) => {
//   // console.log("123456==>", schema)
//   // const validSchema = pick(schema, ['params', 'query', 'headers', 'body']);
//   // const object = pick(req, Object.keys(validSchema));

//   // console.log('Request headers:', req.headers);
//   // console.log('Validation object:', object);


//   // const { value, error } = Joi.compile(validSchema)
//   //   .prefs({ errors: { label: 'key' }, abortEarly: false })
//   //   .validate(object);

//   // if (error) {
//   //   const errorMessage = error.details.map((details) => details.message).join(', ');
//   //   return next(new ApiError(httpStatus.BAD_REQUEST, errorMessage));
//   // }

//   // Object.assign(req, value);
//   // return next();

//   console.log('Extracted headers:',  req);

//   // Create validation schema
//   const validSchema = pick(schema, ['params', 'query', 'headers', 'body']);
//   console.log('Valid schema:', validSchema);

//   // Create validation object with explicit headers
//   const validationObject = {
//     params: req.params,
//     query: req.query,
//     body: req.body,
//     headers: req.headers  // Explicitly include headers
//   };
//   console.log('Validation object before pick:', validationObject);

//   const object = pick(validationObject, Object.keys(validSchema));
//   console.log('Final validation object:', object);

//   const { value, error } = Joi.compile(validSchema)
//     .prefs({ 
//       errors: { label: 'key' }, 
//       abortEarly: false 
//     })
//     .validate(object);

//   if (error) {
//     const errorMessage = error.details.map((details) => details.message).join(', ');
//     console.log('Validation error:', errorMessage);
//     return next(new ApiError(httpStatus.BAD_REQUEST, errorMessage));
//   }

//   console.log('Validated value:', value);
//   Object.assign(req, value);
//   return next();
// };

// module.exports = validate;
