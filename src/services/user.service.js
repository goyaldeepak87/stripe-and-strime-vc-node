const { User, Token, GuestUser, GuestToken } = require('../models');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { hashPassword } = require('../utils/bcryptUtils');



const createUser = async (userBody) => {
    const emailTaken = await User.findOne({ where: { email: userBody.email } });
    if (emailTaken) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
    }
    const password = await hashPassword(userBody?.password)

    const user = await User.create({ ...userBody, password });

    // Create a token for the user
    // const token = await Token.create({
    //     token: uuidv4(),
    //     user_uuid: user.uuid, // Associate the token with the created user
    //     type: 'auth', // You can adjust the type as needed
    //     expires: new Date(new Date().getTime() + 3600000) // Set the expiry time (1 hour for example)
    // });

    return { user };
};

const getUserByEmail = async (email) => {
    return User.findOne({ email });
};

const getUserById = async (id) => {
    return User.findOne({ where: { uuid: id } });
};

const updateUserByPassword = async (userId, new_password) => {
    const password = await hashPassword(new_password)

    const updatedUser = await User.update(
        { password: password }, // Set the new password (hashed)
        { where: { uuid: userId } } // Update user with the provided userId
    );
    // if (!user) {
    //     throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    // }
    // if (updateBody.email && (await User.isEmailTaken(updateBody.email, userId))) {
    //     throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
    // }
    return updatedUser;
};

const userProfileUpdate = async (req, userID) => {
    try {
        const {
            name,
            email,
            dob,
            phone_number,
            gender,
        } = req.body;

        // Handle the profile picture upload if exists
        let profile_picture = req.file ? req.file.filename : null;

        // Prepare the update object
        const updatedFields = {};

        // Only update provided fields
        if (name) updatedFields.name = name;
        if (email) updatedFields.email = email;
        if (dob) updatedFields.dob = dob;
        if (phone_number) updatedFields.phone_number = phone_number;
        if (gender) updatedFields.gender = gender;
        if (profile_picture || profile_picture == null) updatedFields.profile_picture = profile_picture;

        // Check if there are fields to update
        if (Object.keys(updatedFields).length === 0) {
            throw new Error('No fields provided for update');
        }

        // Update the user in the database
        const [updatedCount] = await User.update(updatedFields, {
            where: { uuid: userID.sub },
            returning: true // Ensure you get the updated user back
        });

        if (updatedCount === 0) {
            throw new Error('No user found or no changes made');
        }

        // Fetch the updated user data
        const updatedUser = await User.findOne({ where: { uuid: userID.sub } });

        // Return the updated user profile
        return updatedUser;

    } catch (error) {
        console.error('Error updating user profile:', error);
        throw new Error('An error occurred while updating the profile');
    }
};


// Guest user

const createGuestUser = async (userBody) => {
    const { email, password, role } = userBody;

    // Check if the email is already taken
    const emailTaken = await GuestUser.findOne({ where: { email: userBody.email } });
    if (emailTaken) {
        // Retrieve the user with the password included
        const guestUser = await GuestUser.scope('withPassword').findOne({
            where: { email },
            paranoid: false, // Include soft-deleted users
        });

        // Check if the user exists and compare the password
        if (!guestUser) {
            throw new ApiError(httpStatus.UNAUTHORIZED, 'User not found');
        }

        // Use the instance method `isPasswordMatch` to compare passwords
        const isMatch = await guestUser.isPasswordMatch(password);
        if (!isMatch) {
            throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
        }

        return { guestUser };
    }

    // If email is not taken, create a new guest user
    const guestUser = await GuestUser.create({ ...userBody, name: "Guest User", password, role });

    return { guestUser };
};

module.exports = { createUser, getUserByEmail, getUserById, updateUserByPassword, userProfileUpdate, createGuestUser };
