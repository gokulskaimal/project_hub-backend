import mongoose from "mongoose";
import "dotenv/config";

/**
 * Migration Script: Role Normalization
 * Replaces spaces in roles (e.g. "ORG MANAGER") with underscores ("ORG_MANAGER")
 */

const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  console.error("❌ MONGO_URI not found in environment variables.");
  process.exit(1);
}

async function runMigration() {
  try {
    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(mongoUri!);
    console.log("✅ Connected.");

    const db = mongoose.connection.db;
    if (!db) throw new Error("Database connection failed");

    // 1. Update Users
    console.log("📋 Checking 'users' collection...");
    const userResult = await db
      .collection("users")
      .updateMany({ role: { $regex: /\s/ } }, [
        {
          $set: {
            role: {
              $replaceAll: { input: "$role", find: " ", replacement: "_" },
            },
          },
        },
      ]);
    console.log(`✅ Updated ${userResult.modifiedCount} users.`);

    // 2. Update Invitations
    console.log("📋 Checking 'invites' collection...");
    const inviteResult = await db
      .collection("invites")
      .updateMany({ role: { $regex: /\s/ } }, [
        {
          $set: {
            role: {
              $replaceAll: { input: "$role", find: " ", replacement: "_" },
            },
          },
        },
      ]);
    console.log(`✅ Updated ${inviteResult.modifiedCount} invitations.`);

    console.log("✨ Migration successful!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

runMigration();
