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
            // required: true,
            set(value) {
                const salt = bcrypt.genSaltSync(10);  // Generates a salt with 10 rounds
                const hashPassword = bcrypt.hashSync(value, salt);  // Hash the password synchronously
                this.setDataValue('password', hashPassword);  // Set the hashed password value
            },
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

    // GuestUser.hasMany(sequelize.models.GuestToken, {
    //     foreignKey: 'user_uuid',
    //     sourceKey: 'uuid',
    // });

    GuestUser.associate = (models) => {
        GuestUser.hasMany(models.GuestToken, {
            foreignKey: 'user_uuid',
            sourceKey: 'uuid',
        });
    
        GuestUser.hasMany(models.Payment, {
            foreignKey: 'guest_user_id',
            sourceKey: 'uuid',
        });
    };
    

    return GuestUser;
};

// authController.
