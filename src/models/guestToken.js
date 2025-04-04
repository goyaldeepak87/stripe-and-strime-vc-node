module.exports = (sequelize, DataTypes) => {
    const GuestToken = sequelize.define('GuestToken', {
      token: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      user_uuid: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'GuestUsers', // This should match the name of the user model (case-sensitive)
          key: 'uuid',
        },
      },
      type: {
        type: DataTypes.STRING,
      },
      expires: {
        type: DataTypes.DATE,
      },
    });
  
    GuestToken.associate = (models) => {
      // Token belongs to User
      GuestToken.belongsTo(models.GuestUser, {
        foreignKey: 'user_uuid',
        targetKey: 'uuid', // Make sure this matches the `User` table's `uuid` field
      });
    };
  
    return GuestToken;
  };
  