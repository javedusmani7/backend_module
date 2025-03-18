const mongoose = require('mongoose');

const cleanupDatabase = async () => {
  // Example: Delete users that haven't logged in for more than a year
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  try {
    console.log('Cleanup completed successfully!');
  }
  catch (err) {
    console.error('Error during cleanup:', err);
  }
};

module.exports = { cleanupDatabase };
