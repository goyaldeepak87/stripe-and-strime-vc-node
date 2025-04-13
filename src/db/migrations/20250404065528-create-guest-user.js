'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('GuestUsers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      uuid: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        unique: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },

      // ✅ Role column added here
      role: {
        type: Sequelize.ENUM('host', 'audience'),
        allowNull: false,
        defaultValue: 'audience'
      },

      status: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      payment_status: {
        type: Sequelize.STRING,
        defaultValue: 'pending',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      deletedAt: {
        type: Sequelize.DATE
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Drop ENUM before dropping the table (especially for PostgreSQL)
    await queryInterface.dropTable('GuestUsers');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_GuestUsers_role";');
  }
};
