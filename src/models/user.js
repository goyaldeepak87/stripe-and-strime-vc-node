const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        uuid: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            unique: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            },
        },
        dob: {
            type: DataTypes.DATE,
            validate: {
                isDate: true, // Ensure the value is a valid date
            },
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            required: true,
        },
        phone_number: {
            type: DataTypes.STRING,
        },
        gender: {
            type: DataTypes.STRING,
        },
        dob: {
            type: DataTypes.DATE,
        },
        profile_picture: {
            type: DataTypes.STRING,
            allowNull: true,
            get() {
                const profilePicture = this.getDataValue("profile_picture");
                // const doctor_id = this.getDataValue("doctor_id");
                if (profilePicture) {
                    return `${process.env.BACKEND_URL}/profile/${profilePicture}`;
                } else {
                    return null;
                }
            },
        },
        status: {
            type: DataTypes.BOOLEAN,
            defaultValue: true, // active by default
        },
        is_verified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false, // not verified by default
        },
        is_blocked: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        role: {
            type: DataTypes.STRING,
            defaultValue: 'user', // 'user' is default role
        },
    },
        {
            paranoid: true,
            timestamps: true,
            defaultScope: {
                attributes: { exclude: ['password'] },  // Password is excluded here by default
            },
            scopes: {
                withPassword: {
                    attributes: { include: ['password'] }, // Include the password for authentication
                },
            },
        });

    // Method to compare passwords
    User.prototype.isPasswordMatch = async function (password) {
        if (!this.password) {
            throw new Error('Password is not set');
        }
        const isMatch = await bcrypt.compare(password, this.password);
        return isMatch;
    };

    User.hasMany(sequelize.models.Token, {
        foreignKey: 'user_uuid',
        sourceKey: 'uuid',
    });

    return User;
};
