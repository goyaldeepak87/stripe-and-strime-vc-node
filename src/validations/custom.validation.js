const objectId = (value, helpers) => {
  if (!value.match(/^[0-9a-fA-F]{24}$/)) {
    return helpers.message('"{{#label}}" must be a valid mongo id');
  }
  return value;
};

const password = (value, helpers) => {
  if (value.length < 8) {
    return helpers.message('password must be at least 8 characters');
  }
  if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
    return helpers.message('password must contain at least 1 letter and 1 number');
  }
  return value;
};

const deviceInfoHeader = (req, res, next) => {
  const deviceInfoHeader = req?.headers;
  const deviceInfo = deviceInfoHeader ? deviceInfoHeader : {};
  const validDeviceTypes = ['ios', 'android', 'web'];

  // Construct device information object
  const deviceInfoData = {
    deviceId: deviceInfo?.deviceid || null,
    deviceType: deviceInfo?.devicetype || null,
    deviceName: deviceInfo?.devicename || null,
    ipAddress: deviceInfo?.ipaddress || null,
    errors: [],
  };

  if (!deviceInfoData.deviceId || !deviceInfoData.deviceType || !deviceInfoData.deviceName || !deviceInfoData.ipAddress) {
    deviceInfoData.errors.push('Missing required device information.');
    return res.status(400).json({
      success: false,
      message: 'Invalid device information in headers.ssss',
      errors: deviceInfoData.errors,
    });
  } else if (!validDeviceTypes.includes(deviceInfo.devicetype.toLowerCase())) {
    deviceInfoData.errors.push('Invalid device type');
    return res.status(500).json({
      success: false,
      message: 'Invalid device information in headers.',
      errors: deviceInfoData.errors,
    });
  }
  next()
}


module.exports = {
  objectId,
  password,
  deviceInfoHeader,
};
