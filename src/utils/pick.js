/**
 * Create an object composed of the picked object properties
 * @param {Object} object
 * @param {string[]} keys
 * @returns {Object}
 */


// const pick = (object, keys) => {
//   return keys.reduce((obj, key) => {
//     if (object && Object.prototype.hasOwnProperty.call(object, key)) {
//       // eslint-disable-next-line no-param-reassign
//       obj[key] = object[key];
//     }
//     return obj;
//   }, {});
// };

const pick = (object, keys) => {
  const result = keys.reduce((obj, key) => {
    if (key === 'headers' && object.headers) {
      obj.headers = object.headers;
    } else if (object && Object.prototype.hasOwnProperty.call(object, key)) {
      obj[key] = object[key];
    }
    
    return obj;
  }, {});
  return result;
};

module.exports = pick;
