module.exports = {
  apps: [
    {
      name: 'calamusApi',
      script: 'server.js',
      watch: true,
      env: {
        NODE_ENV: 'production',
      },
      instances: 'max',
      // eslint-disable-next-line @typescript-eslint/camelcase
      exec_mode: 'cluster',
    },
  ],
};
