import { Request, Response, NextFunction } from 'express';
import logger from '@logger';

/**
 * This describes a typical async function in Express
 */
type AsyncFunction = (request: Request, response: Response, next: NextFunction) => Promise<any>;

export default(execution: AsyncFunction) => (request: Request, response: Response, next: NextFunction) => {
    try {
        logger.debug(`AsyncHandler execution...`);
        execution(request, response, next);
    } catch (error) {
        logger.error(`AsyncHandler Err: ${error}`);
        throw new Error(error.message);
    }
};