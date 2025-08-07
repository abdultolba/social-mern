// Load environment variables first
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { sequelize, Notification } = require("../models");

async function syncNotifications() {
  try {
    console.log("Syncing Notification table...");
    
    // This will create the table if it doesn't exist, or update the schema if needed
    await Notification.sync({ alter: true });
    
    console.log("✅ Notification table synced successfully!");
  } catch (error) {
    console.error("❌ Error syncing Notification table:", error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run the sync
syncNotifications();
