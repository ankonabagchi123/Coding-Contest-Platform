import axios from "axios";
import { JUDGE0_TO_VERDICT } from "../config/constants.js";
import { ApiError } from "./apiError.js";

// Piston public API — free, no key required
const PISTON_URL = "https://emkc.org/api/v2/piston/execute";

// Map our language keys → Piston language + version
const PISTON_LANGUAGES = {
  cpp:        { language: "c++",        version: "10.2.0" },
  c:          { language: "c",          version: "10.2.0" },
  java:       { language: "java",       version: "15.0.2" },
  python:     { language: "python",     version: "3.10.0" },
  javascript: { language: "javascript", version: "18.15.0" },
  typescript: { language: "typescript", version: "5.0.3"  },
  go:         { language: "go",         version: "1.16.2" },
  rust:       { language: "rust",       version: "1.68.2" },
  csharp:     { language: "csharp",     version: "6.12.0" },
};

/**
 * Execute code via Piston.
 * Returns an object shaped like Judge0's response so the
 * rest of the codebase (submission.service.js) works unchanged.
 */
export const executeCode = async ({
  sourceCode,
  language,
  stdin = "",
  timeLimit = 2,
  memoryLimit = 256000,
}) => {
  const langConfig = PISTON_LANGUAGES[language];
  if (!langConfig) {
    throw ApiError.badRequest(`Unsupported language: ${language}`);
  }

  try {
    const { data } = await axios.post(
      PISTON_URL,
      {
        language: langConfig.language,
        version: langConfig.version,
        files: [{ content: sourceCode }],
        stdin,
        compile_timeout: 10000,
        run_timeout: Math.round(timeLimit * 1000),
        compile_memory_limit: memoryLimit * 1024,
        run_memory_limit: memoryLimit * 1024,
      },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 30000,
      }
    );

    return normalizePistonResponse(data);
  } catch (err) {
    if (err.response) {
      throw ApiError.internal(
        `Piston error: ${err.response.status} ${err.response.statusText}`
      );
    }
    if (err.code === "ECONNABORTED") {
      throw ApiError.internal("Piston request timed out");
    }
    throw ApiError.internal(`Piston request failed: ${err.message}`);
  }
};

/**
 * Convert Piston's response into a Judge0-shaped response
 * so downstream code (mapVerdict) doesn't need changes.
 */
const normalizePistonResponse = (piston) => {
  // Piston response shape:
  // {
  //   language, version,
  //   run: { stdout, stderr, code, signal, output },
  //   compile?: { stdout, stderr, code, signal, output }
  // }

  const compile = piston.compile || null;
  const run = piston.run || {};

  // Compilation failed?
  if (compile && compile.code !== 0) {
    return {
      stdout: "",
      stderr: compile.stderr || "",
      compile_output: compile.stderr || compile.output || "Compilation failed",
      time: "0",
      memory: 0,
      status: { id: 6, description: "Compilation Error" }, // CE
    };
  }

  // Runtime error?
  if (run.signal) {
    return {
      stdout: run.stdout || "",
      stderr: run.stderr || `Process killed by signal ${run.signal}`,
      compile_output: "",
      time: "0",
      memory: 0,
      status: {
        id: run.signal === "SIGKILL" ? 5 : 11, // TLE or RE
        description: `Runtime Error (${run.signal})`,
      },
    };
  }

  if (run.code !== 0) {
    return {
      stdout: run.stdout || "",
      stderr: run.stderr || "",
      compile_output: "",
      time: "0",
      memory: 0,
      status: { id: 11, description: "Runtime Error" }, // RE
    };
  }

  // Success — return stdout
  return {
    stdout: run.stdout || "",
    stderr: run.stderr || "",
    compile_output: "",
    time: "0",
    memory: 0,
    status: { id: 3, description: "Accepted" }, // AC
  };
};

/**
 * Map normalized result → our verdict code.
 * Kept compatible with Judge0 status ids (see constants.js).
 */
export const mapVerdict = (result) => {
  const statusId = result?.status?.id;
  return JUDGE0_TO_VERDICT[statusId] || "IE";
};

/**
 * Normalize stdout for comparison
 */
const normalize = (str = "") =>
  str
    .toString()
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .trim();

/**
 * Compare actual output to expected
 */
export const outputsMatch = (actual, expected) => {
  return normalize(actual) === normalize(expected);
};