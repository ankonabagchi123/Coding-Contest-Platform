import dotenv from "dotenv";

dotenv.config();

const required = ["MONGO_URI", "JWT_SECRET"];

required.forEach((key) => {
  if (!process.env[key]) {
    console.error(`❌ Missing required env var: ${key}`);
    process.exit(1);
  }
});

export const env = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || "development",
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  JUDGE0_KEY: process.env.JUDGE0_KEY,
  JUDGE0_HOST: process.env.JUDGE0_HOST || "judge0-ce.p.rapidapi.com",
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
};