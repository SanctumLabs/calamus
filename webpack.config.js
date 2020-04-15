const path = require("path");
const nodeExternals = require("webpack-node-externals");
const WebpackShellPlugin = require("webpack-shell-plugin");

const { NODE_ENV = "production" } = process.env;

module.exports = {
  entry: "./src/server.ts",
  mode: NODE_ENV,
  target: "node",
  watch: NODE_ENV === "development",
  externals: [nodeExternals()],
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "server.js",
  },
  resolve: {
    extensions: [".ts", ".js"],
    alias: {
      "@app": path.resolve("src/app.ts"),
      "@config": path.resolve("src/config.ts"),
      "@database": path.resolve("src/database/"),
      "@repository": path.resolve("src/database/repository/"),
      "@core": path.resolve("src/core/"),
      "@jwt": path.resolve("src/core/jwt/JWT.ts"),
      "@logger": path.resolve("src/core/logger.ts"),
      "@routes": path.resolve("src/routes/index.ts"),
      "@security": path.resolve("src/security/"),
      "@authentication": path.resolve("src/security/authentication/"),
      "@authorization": path.resolve("src/security/authorization/"),
      "@authUtils": path.resolve("src/security/authUtils/index.ts"),
      "@utils": path.resolve("src/utils/"),
      "app-request": path.resolve("src/types/app-request.d.ts"),
    },
  },
  plugins:
    NODE_ENV === "production"
      ? []
      : [
          new WebpackShellPlugin({
            onBuildEnd: ["yarn watch"],
          }),
        ],
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: ["ts-loader"],
      },
    ],
  },
};
