import dns from "node:dns";
dns.setServers(["1.1.1.1", "8.8.8.8"]);

import { connectDB } from "../src/config/db.js";
import { User } from "../src/models/User.js";

const run = async () => {
  await connectDB();

  const email = "admin@test.com";
  const existing = await User.findOne({ email });

  if (existing) {
    console.log("⚠️  Admin already exists");
    process.exit(0);
  }

  await User.create({
    name: "Admin",
    email,
    password: "admin123",
    role: "admin",
  });

  console.log("✅ Admin created:");
  console.log("   Email:    admin@test.com");
  console.log("   Password: admin123");
  console.log("   Role:     admin");
  process.exit(0);
};

run().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});