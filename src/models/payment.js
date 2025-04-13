// Payment Model
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
                model: 'GuestUsers',
                key: 'uuid',
            },
        },
        meeting_id: {  // Add this new field to reference the meeting
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Meetings',
                key: 'id',
            },
        },
        amount_paid: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        payment_status: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'pending',
            validate: {
                isIn: [['pending', 'paid', 'failed', 'refunded']]
            }
        },
        stripe_session_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    }, {
        timestamps: true,
        paranoid: true,
    });

    Payment.associate = (models) => {
        // Correct the relationship to GuestUser
        Payment.belongsTo(models.GuestUser, {
            foreignKey: 'guest_user_id',
            targetKey: 'uuid',
        });
        
        // Add relationship to Meeting
        Payment.belongsTo(models.Meeting, {
            foreignKey: 'meeting_id',
            targetKey: 'id',
        });
    };

    return Payment;
};