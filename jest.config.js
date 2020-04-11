module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/tests", "<rootDir>/src/**/*.test.ts"],
  setupFiles: ["<rootDir>/scripts/setup.ts"],
  collectCoverageFrom: ["<rootDir>/src/**/*.ts", "!**/node_modules/**"],
  moduleNameMapper: {
    "^@config": "<rootDir>/src/config.ts",
    "^@database/(.*)$": "<rootDir>/src/database/$1",
    "^@core/(.*)$": "<rootDir>/src/core/$1",
    "^@logger": "<rootDir>/src/core/logger.ts",
    "^@routes/(.*)$": "<rootDir>/src/routes/$1",
    "^@routesv1/(.*)$": "<rootDir>/src/routes/v1/$1",
    "^@auth/(.*)$": "<rootDir>/src/auth/$1",
  },
};
