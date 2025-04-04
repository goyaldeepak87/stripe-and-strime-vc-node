const bcrypt = require('bcryptjs');

const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);  // Generates a salt with 10 rounds
    return await bcrypt.hash(password, salt);  // Hash the password with the salt
};

module.exports = {
    hashPassword
};
