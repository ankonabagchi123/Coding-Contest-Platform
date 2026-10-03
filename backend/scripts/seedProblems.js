import dns from "node:dns";
dns.setServers(["1.1.1.1", "8.8.8.8"]);

import { connectDB } from "../src/config/db.js";
import { Problem } from "../src/models/Problem.js";
import { User } from "../src/models/User.js";

const seed = async () => {
  await connectDB();

  const admin = await User.findOne({ role: "admin" });
  if (!admin) {
    console.error("❌ Create an admin first: node scripts/seedAdmin.js");
    process.exit(1);
  }

  const existing = await Problem.findOne({ slug: "two-sum" });
  if (existing) {
    console.log("⚠️  Problems already seeded");
    process.exit(0);
  }

  await Problem.create({
    title: "Two Sum",
    description:
      "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input has exactly one solution.",
    summary: "Find two numbers that add up to target",
    difficulty: "easy",
    tags: ["array", "hash-table"],
    constraints: "2 <= nums.length <= 10^4",
    inputFormat: "First line: n and target\nSecond line: n integers",
    outputFormat: "Two space-separated indices",
    sampleTestCases: [
      { input: "4 9\n2 7 11 15", output: "0 1" },
      { input: "3 6\n3 2 4", output: "1 2" },
    ],
    hiddenTestCases: [
      { input: "2 6\n3 3", output: "0 1" },
      { input: "5 10\n1 2 3 4 6", output: "3 4" },
    ],
    timeLimit: 2,
    memoryLimit: 256000,
    createdBy: admin._id,
  });

  console.log("✅ Seed complete — 1 problem added");
  process.exit(0);
};

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});