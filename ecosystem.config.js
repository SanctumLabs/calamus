module.exports = {
  apps: [
    {
      name: "calamusApi",
      script: "server.js",
      watch: true,
      env: {
        NODE_ENV: "production",
      },
      instances: "max",
      exec_mode: "cluster",
    },
  ],
};
