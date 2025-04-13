// Meeting Model
module.exports = (sequelize, DataTypes) => {
    const Meeting = sequelize.define('Meeting', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        user_uuid: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'GuestUsers',
                key: 'uuid',
            },
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        roomId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        price: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        scheduledFor: {
            type: DataTypes.DATE,
            allowNull: false,
        },
    }, {
        paranoid: true,
        timestamps: true,
    });

    Meeting.associate = (models) => {
        Meeting.belongsTo(models.GuestUser, {
            foreignKey: 'user_uuid',
            targetKey: 'uuid',
        });
        // Change this to hasMany - one meeting can have multiple payments from different users
        Meeting.hasMany(models.Payment, {
            foreignKey: 'meeting_id',
            sourceKey: 'id',
        });
    };

    return Meeting;
};