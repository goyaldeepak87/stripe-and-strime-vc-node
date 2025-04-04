// 'use strict';

// /** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        type: Sequelize.INTEGER,
        primaryKey: true,
      },
      uuid: {
        allowNull: false,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV1,
        // primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
      },
      email: {
        type: Sequelize.STRING,
      },
      dob: {
        type: DataTypes.DATE,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: true,
        required: true,
      },
      phone_number: {
        type: DataTypes.STRING,
      },
      status: {
        type: Sequelize.BOOLEAN,
      },
      is_blocked: {
        type: Sequelize.BOOLEAN,
        defaultValue: false, // not verified by default
      },
      role: {
        type: DataTypes.STRING,
        defaultValue: 'user', // 'user' is default role
      },
      is_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false, // not verified by default
      },
      gender: {
        type: Sequelize.STRING,
      },
      profile_picture: {
        type: DataTypes.STRING,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Users');
  },
};
