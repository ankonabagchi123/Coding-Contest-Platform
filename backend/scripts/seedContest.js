import dns from "node:dns";
dns.setServers(["1.1.1.1", "8.8.8.8"]);

import { connectDB } from "../src/config/db.js";
import { User } from "../src/models/User.js";
import { Problem } from "../src/models/Problem.js";
import { Contest } from "../src/models/Contest.js";

const run = async () => {
  await connectDB();

  const admin = await User.findOne({ role: "admin" });
  if (!admin) {
    console.error("❌ Create admin first: node scripts/seedAdmin.js");
    process.exit(1);
  }

  const twoSum = await Problem.findOne({ slug: "two-sum" });
  if (!twoSum) {
    console.error("❌ Create a problem first: node scripts/seedProblems.js");
    process.exit(1);
  }

  const existing = await Contest.findOne({ slug: "weekly-1" });
  if (existing) {
    console.log("⚠️  Contest already exists");
    process.exit(0);
  }

  // Start 1 hour from now, end 24 hours later (so it shows as upcoming)
  // Change these if you want it live immediately
  const now = new Date();
  const startTime = new Date(now.getTime() + 60 * 60 * 1000);          // +1h
  const endTime = new Date(startTime.getTime() + 24 * 60 * 60 * 1000); // +24h

  const contest = await Contest.create({
    title: "Weekly Contest 1",
    description:
      "Welcome to our first weekly contest! Solve the problems as fast as possible.",
    startTime,
    endTime,
    isPublic: true,
    problems: [
      { problem: twoSum._id, points: 100, label: "A", order: 0 },
    ],
    rules: "1. No external help.\n2. Any language allowed.\n3. Plagiarism = disqualification.",
    createdBy: admin._id,
  });

  console.log("✅ Contest created:");
  console.log("   Title:  ", contest.title);
  console.log("   Slug:   ", contest.slug);
  console.log("   Starts: ", startTime.toISOString());
  console.log("   Ends:   ", endTime.toISOString());
  console.log("   Status: upcoming");
  process.exit(0);
};

run().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});