module.exports = (sequelize, DataTypes) => {
    const Payment = sequelize.define('Payment', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        guest_user_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'GuestUsers', // Table name for GuestUser
                key: 'uuid',
            },
        },
        amount_paid: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        payment_status: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'pending', // Default status
        },
        stripe_session_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        product_info: {
            type: DataTypes.TEXT, // Store product info as JSON string
            allowNull: true,
        },
    }, {
        timestamps: true, // Automatically adds createdAt and updatedAt fields
        paranoid: true,   // Adds deletedAt field for soft deletes
    });

    Payment.associate = (models) => {
        Payment.belongsTo(models.GuestUser, {
            foreignKey: 'guest_user_id',
            targetKey: 'uuid',
        });
    };

    return Payment;
};