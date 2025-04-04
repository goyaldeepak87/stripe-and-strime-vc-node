const db = require('../models');
const Users = db.user


const isEmailTaken = async (email) => {
    return Users.count({ where: { email } }).then((count) => {
        if (count != 0) {
            return true;
        }
        return false;
    });
};


module.exports = {
    isEmailTaken
}