// Language IDs from Judge0
export const LANGUAGES = {
  cpp: 54,        // C++ (GCC 9.2.0)
  c: 50,          // C (GCC 9.2.0)
  java: 62,       // Java (OpenJDK 13.0.1)
  python: 71,     // Python (3.8.1)
  javascript: 63, // JavaScript (Node.js 12.14.0)
  typescript: 74, // TypeScript (3.7.4)
  go: 60,         // Go (1.13.5)
  rust: 73,       // Rust (1.40.0)
  csharp: 51,     // C# (Mono 6.6.0.161)
};

// Judge0 status codes
export const JUDGE0_STATUS = {
  IN_QUEUE: 1,
  PROCESSING: 2,
  ACCEPTED: 3,
  WRONG_ANSWER: 4,
  TIME_LIMIT_EXCEEDED: 5,
  COMPILATION_ERROR: 6,
  RUNTIME_ERROR_SIGSEGV: 7,
  RUNTIME_ERROR_SIGXFSZ: 8,
  RUNTIME_ERROR_SIGFPE: 9,
  RUNTIME_ERROR_SIGABRT: 10,
  RUNTIME_ERROR_NZEC: 11,
  RUNTIME_ERROR_OTHER: 12,
  INTERNAL_ERROR: 13,
  EXEC_FORMAT_ERROR: 14,
};

// Our verdict labels
export const VERDICTS = {
  AC: "Accepted",
  WA: "Wrong Answer",
  TLE: "Time Limit Exceeded",
  MLE: "Memory Limit Exceeded",
  CE: "Compilation Error",
  RE: "Runtime Error",
  PENDING: "Pending",
  IE: "Internal Error",
};

// Map Judge0 status → our verdict
export const JUDGE0_TO_VERDICT = {
  3: "AC",
  4: "WA",
  5: "TLE",
  6: "CE",
  7: "RE",
  8: "RE",
  9: "RE",
  10: "RE",
  11: "RE",
  12: "RE",
  13: "IE",
  14: "CE",
};

// User roles
export const ROLES = {
  USER: "user",
  ADMIN: "admin",
};

// Contest statuses
export const CONTEST_STATUS = {
  UPCOMING: "upcoming",
  LIVE: "live",
  ENDED: "ended",
};

// Difficulty
export const DIFFICULTY = {
  EASY: "easy",
  MEDIUM: "medium",
  HARD: "hard",
};

// Default limits
export const DEFAULT_TIME_LIMIT = 2;   // seconds
export const DEFAULT_MEMORY_LIMIT = 256000; // KB (256 MB)