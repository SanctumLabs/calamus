module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  // roots: ["<rootDir>/src/**/*.test.ts"],
  testMatch: [
    "<rootDir>/__tests__/**/*.{js,ts,tsx,jsx,mjs}",
    "<rootDir>/?(*.)(spec|test).{js,jsx,ts,tsx,mjs}",
    "<rootDir>/src/**/__tests__/**/*.{js,ts,tsx,jsx,mjs}",
    "<rootDir>/src/**/?(*.)(spec|test).{js,ts,tsx,jsx,mjs}",
  ],
  setupFiles: ["<rootDir>/scripts/setup.ts"],
  collectCoverageFrom: ["<rootDir>/src/**/*.ts", "!**/node_modules/**"],
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  moduleNameMapper: {
    "^@config": "<rootDir>/src/config.ts",
    "^@database/(.*)$": "<rootDir>/src/database/$1",
    "^@repository/(.*)$": "<rootDir>/src/database/repository/$1",
    "^@core/(.*)$": "<rootDir>/src/core/$1",
    "^@jwt": "<rootDir>/src/core/JWT.ts",
    "^@logger": "<rootDir>/src/core/logger.ts",
    "^@routes/(.*)$": "<rootDir>/src/routes/$1",
    "^@routesv1/(.*)$": "<rootDir>/src/routes/v1/$1",
    "^@security/(.*)$": "<rootDir>/src/security/$1",
    "^@utils/(.*)$": "<rootDir>/src/utils/$1",
    "app-request": "<rootDir>/src/types/app-request.d.ts",
  },
};
