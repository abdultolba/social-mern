// Load env and sequelize
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const { sequelize } = require("../models");

async function migrate() {
  const qi = sequelize.getQueryInterface();
  try {
    console.log("Altering Posts.extraValue to TEXT...");

    // Detect if column exists and its type; fallback to changeColumn
    const tableDesc = await qi.describeTable("Posts").catch(() => ({}));

    if (
      tableDesc.extraValue &&
      tableDesc.extraValue.type &&
      tableDesc.extraValue.type.toLowerCase().includes("character varying")
    ) {
      await qi.changeColumn("Posts", "extraValue", {
        type: sequelize.Sequelize.TEXT,
        allowNull: true,
      });
      console.log("Posts.extraValue changed to TEXT");
    } else {
      // Still attempt change; if already TEXT this will be a no-op or succeed
      await qi.changeColumn("Posts", "extraValue", {
        type: sequelize.Sequelize.TEXT,
        allowNull: true,
      });
      console.log("Posts.extraValue ensured TEXT");
    }
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

migrate();
