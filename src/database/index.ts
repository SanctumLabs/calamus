import mongoose from 'mongoose';
import logger from '@logger';
import { db } from '@config';

// build the connection string
const dbURI = `mongodb://${db.user}:${encodeURIComponent(db.password)}@${db.host}:${db.port}/${
  db.name
}`;

// connection options
const options = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  autoIndex: true,
  poolSize: 10, // Maintain up to 10 socket connections
  // If not connected, return errors immediately rather than waiting for reconnect
  bufferMaxEntries: 0,
  connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
};

logger.debug(`Connection string ${dbURI}`);

mongoose
  .connect(dbURI, options)
  .then(() => logger.info('Successfully connected to MongoDB'))
  .catch((e) => {
    logger.warn('MongoDB connection failed');
    logger.error(`Failed to connect with error ${e}`);
  });

// CONNECTION EVENTS
// When successfully connected
mongoose.connection.on('connected', () => {
  logger.info('MongoDB default connection open to ' + dbURI);
});

// If the connection throws an error
mongoose.connection.on('error', (err) => {
  logger.error('MongoDB default connection error: ' + err);
});

// When the connection is disconnected
mongoose.connection.on('disconnected', () => {
  logger.info('MongoDB default connection disconnected');
});

// If the Node process ends, close the Mongoose connection
process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    logger.info('MongoDB default connection disconnected through app termination');
    process.exit(0);
  });
});
