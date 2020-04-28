import logger from '@logger';
import { port } from '@config';
import app from './app';

app
  .listen(port, () => {
    logger.info(`server running on port : ${port}`);
  })
  .on('error', (e) => logger.error(e));
