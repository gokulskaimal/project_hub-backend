import "dotenv/config";
import mongoose from "mongoose";

async function fixIndexes() {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error("No MongoDB URI provided.");
      process.exit(1);
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("Connected.");

    const db = mongoose.connection.db;
    if (!db) {
      console.error("Database connection failed.");
      process.exit(1);
    }

    const collection = db.collection("users");
    const indexes = await collection.indexes();
    console.log("Current indexes:", indexes);

    const googleIdIndex = indexes.find((idx) => idx.name === "googleId_1");

    if (googleIdIndex) {
      console.log("Found googleId_1 index. Dropping it...");
      await collection.dropIndex("googleId_1");
      console.log("Index dropped successfully.");
    } else {
      console.log("googleId_1 index not found.");
    }

    console.log("Done. You can now restart your server.");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

fixIndexes();
