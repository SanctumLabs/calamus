import { Request, Response, NextFunction } from 'express';

/**
 * This describes a typical async function in Express
 */
type AsyncFunction = (request: Request, response: Response, next: NextFunction) => Promise<any>;

export default(execution: AsyncFunction) => (request: Request, response: Response, next: NextFunction) => {
    try {
        execution(request, response, next);
    } catch (error) {
        //
    }
};