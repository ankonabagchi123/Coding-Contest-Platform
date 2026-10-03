const colors = {
  info: "\x1b[36m",
  warn: "\x1b[33m",
  error: "\x1b[31m",
  success: "\x1b[32m",
  reset: "\x1b[0m",
};

const timestamp = () => new Date().toISOString();

export const logger = {
  info: (msg) => console.log(`${colors.info}[INFO] ${timestamp()} — ${msg}${colors.reset}`),
  warn: (msg) => console.warn(`${colors.warn}[WARN] ${timestamp()} — ${msg}${colors.reset}`),
  error: (msg) => console.error(`${colors.error}[ERROR] ${timestamp()} — ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.success}[OK] ${timestamp()} — ${msg}${colors.reset}`),
};