import { createLogger, transports, format } from 'winston';
import { environment } from '@config';

const logLevel = environment === 'development' ? 'debug' : 'warn';

export default createLogger({
  transports: [
    new transports.Console({
      level: logLevel,
      format: format.combine(format.errors({ stack: true }), format.prettyPrint()),
      handleExceptions: true,
    }),
  ],
  exitOnError: false, // do not exit on handled exceptions
});
