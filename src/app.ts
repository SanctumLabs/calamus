import express, { Request, Response, NextFunction } from 'express';
import logger from '@logger';
import bodyParser from 'body-parser';
import cors from 'cors';
import { corsUrl, environment } from '@config';
import { NotFoundError, ApiError, InternalError } from '@core/ApiError';
import '@database'; // initialize database
// import routesV1 from '@routesv1';

process.on('uncaughtException', e => {
    logger.error(e);
});

const app = express();

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true, parameterLimit: 50000 }));
app.use(cors({ origin: corsUrl, optionsSuccessStatus: 200 }));

// catch 404 and forward to error handler
app.use((req, res, next) => next(new NotFoundError()));

// Middleware Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
	if (err instanceof ApiError) {
		ApiError.handle(err, res);
	} else {
		if (environment === 'development') {
			logger.error(err);
			return res.status(500).send(err.message);
		}
		ApiError.handle(new InternalError(), res);
	}
});

export default app;