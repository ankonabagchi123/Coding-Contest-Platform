import dns from "node:dns";
dns.setServers(["1.1.1.1", "8.8.8.8"]);

import { connectDB } from "./src/config/db.js";
import { User, Problem, Contest, Submission, Registration } from "./src/models/index.js";

await connectDB();

console.log("User model:", User.modelName);
console.log("Problem model:", Problem.modelName);
console.log("Contest model:", Contest.modelName);
console.log("Submission model:", Submission.modelName);
console.log("Registration model:", Registration.modelName);

console.log("✅ All models registered");
process.exit(0);