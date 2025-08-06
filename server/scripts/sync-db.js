const { sequelize } = require("../models");

async function syncDatabase() {
  try {
    console.log("yncing database schema...");

    // Force sync will drop existing tables and recreate them with new schema
    await sequelize.sync({ force: true });

    console.log("Database schema synchronized successfully!");
    console.log("⚠️ All existing data has been cleared.");

    process.exit(0);
  } catch (error) {
    console.error("Error syncing database:", error);
    process.exit(1);
  }
}

syncDatabase();
