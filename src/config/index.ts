import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z
    .string()
    .transform((s) => Number(s))
    .default("5000"),
  MONGO_URI: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(10),
  JWT_REFRESH_SECERT: z.string().min(10),
  BCRYPT_ROUNDS: z
    .string()
    .transform((s) => Number(s))
    .default("10"),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error("invalid environment variables", parsed.error.format());
  process.exit(1);
}

export const config = {
  nodeEnv: parsed.data.NODE_ENV,
  port: parsed.data.PORT,
  mongoUri: parsed.data.MONGO_URI,
  jwt: {
    accessSecret: parsed.data.JWT_ACCESS_SECRET,
    refreshSecret: parsed.data.JWT_REFRESH_SECERT,
  },
  bcryptRounds: parsed.data.BCRYPT_ROUNDS,
  corsOrigin: parsed.data.CORS_ORIGIN,
};
