module.exports = (sequelize, DataTypes) => {
  const Token = sequelize.define('Token', {
    token: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    user_uuid: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users', // This should match the name of the user model (case-sensitive)
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

  Token.associate = (models) => {
    // Token belongs to User
    Token.belongsTo(models.User, {
      foreignKey: 'user_uuid',
      targetKey: 'uuid', // Make sure this matches the `User` table's `uuid` field
    });
  };

  return Token;
};
