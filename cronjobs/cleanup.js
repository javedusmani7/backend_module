const cron = require('node-cron');
const { cleanupDatabase } = require('../utils/cleanupUtils');  // A function that handles your cleanup logic.

// Run cleanup task every day at midnight
cron.schedule('0 0 * * *', async () => {
  console.log('Running database cleanup...');
  await cleanupDatabase();
});
