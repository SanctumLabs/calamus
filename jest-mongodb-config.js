module.exports = {
  mongodbMemoryServerOptions: {
    instance: {
      dbName: 'calamus-blog-test-db',
    },
    binary: {
      version: '4.2.5',
      skimMD5: true,
    },
    autorStart: false,
  },
};
