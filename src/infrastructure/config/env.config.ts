export const ENV = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT || 5000),
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
  MONGO_URI: process.env.MONGO_URI || process.env.MONGODB_URI || "",
  JWT_SECRET: process.env.JWT_SECRET || "change-me",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "change-me",
  MAX_AGE: Number(process.env.MAX_AGE || 60 * 60 * 24 * 7),
  USE_REDIS: String(process.env.USE_REDIS || "").toLowerCase() === "true",
  REDIS_URL: process.env.REDIS_URL || "redis://127.0.0.1:6379",
  COOKIE_SECURE:
    String(process.env.COOKIE_SECURE || "").toLowerCase() === "true",
};
