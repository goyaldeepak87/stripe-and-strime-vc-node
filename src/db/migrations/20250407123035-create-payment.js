'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Payments', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      guest_user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'GuestUsers',
          key: 'uuid'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      meeting_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Meetings',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      amount_paid: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      payment_status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'pending'
      },
      stripe_session_id: {
        type: Sequelize.STRING,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    // Optional: Add check constraint for payment_status if your DB supports it
    // await queryInterface.addConstraint('Payments', {
    //   fields: ['payment_status'],
    //   type: 'check',
    //   where: {
    //     payment_status: ['pending', 'paid', 'failed', 'refunded']
    //   }
    // });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Payments');
  }
};
