const cron = require('node-cron');
const { User } = require('../models');
const { Op } = require('sequelize');

// Cron job to run every midnight (00:00) and check for users to delete after 1 day
cron.schedule('0 0 * * *', async () => {
    try {
        console.log('Checking for users to delete...');

        // Find all users who requested deletion more than 24 hours ago
        const usersToDelete = await User.findAll({
            where: {
                delete_requested_at: {
                    [Op.lt]: new Date(Date.now() - 24 * 60 * 60 * 1000), // More than 1 day ago
                },
                delete_requested_at: {
                    [Op.ne]: null, // Ensure the user actually requested deletion
                }
            },
        });

        // Delete users who are past the 1-day mark
        for (const user of usersToDelete) {
            await user.destroy();
            // console.log(`User ${user.uuid} deleted after 1 day of deletion request.`);
        }
    } catch (error) {
        console.error('Error while deleting users:', error);
    }
});
