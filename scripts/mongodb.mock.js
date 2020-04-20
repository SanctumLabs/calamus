const mongoose = require("mongoose");
const { MongoClient } = require("mongodb");

mongoose.connect(
  global.__MONGO_URI__,
  {
    useNewUrlParser: true,
    useCreateIndex: true,
  },
  (err) => {
    if (err) {
      console.error(`Failed to setup mock mongodb with error ${err}`);
      process.exit(1);
    }
  }
);

describe("insert", () => {
  let connection;
  let db;

  beforeAll(async () => {
    connection = await MongoClient.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    db = await connection.db();
  });

  afterAll(async () => {
    await connection.close();
  });
});
