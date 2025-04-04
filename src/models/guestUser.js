const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
    const GuestUser = sequelize.define('GuestUser', {
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
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            required: true,
        },
        status: {
            type: DataTypes.BOOLEAN,
            defaultValue: true, // active by default
        }
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
    GuestUser.prototype.isPasswordMatch = async function (password) {
        if (!this.password) {
            throw new Error('Password is not set');
        }
        const isMatch = await bcrypt.compare(password, this.password);
        return isMatch;
    };

    GuestUser.hasMany(sequelize.models.GuestToken, {
        foreignKey: 'user_uuid',
        sourceKey: 'uuid',
    });

    return GuestUser;
};

// authController.
