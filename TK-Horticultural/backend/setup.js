'use strict';

const db = require('./models');

(async () => {
  try {
    console.log('Setting up database tables...');

    // Sync all models to create/update tables (safe: does not drop existing data)
    await db.sequelize.sync({ alter: true });

    console.log('Database tables ready.');
    process.exit(0);
  } catch (error) {
    console.error('Setup failed:', error);
    process.exit(1);
  }
})();