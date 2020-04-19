import express, { Request, Response, NextFunction } from 'express';
import logger from '@logger';
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
import { corsUrl, environment } from '@config';
import { NotFoundError, ApiError, InternalError } from '@core/ApiError';
import '@database'; // initialize database
import routes from '@routes';

process.on('uncaughtException', e => {
    logger.error(e);
});

const app = express();

app.use(helmet());

app.disable('x-powered-by');
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true, parameterLimit: 50000 }));
app.use(cors({ origin: corsUrl, optionsSuccessStatus: 200 }));

// health route
// log all incoming requests
app.use(async (request: Request, response: Response, next: NextFunction) => {
	const start = Date.now();

	// this will pause the control flow until the endpoint handler is resolved
	await next();
	const responseTime = Date.now() - start;
	logger.info(`Method: ${request.method}, StatusCode: ${response.statusCode}, URL: ${request.url}, - ResponseTime: ${responseTime} ms`);
});

// apply default header responses
app.use(async (request: Request, response: Response, next: NextFunction) => {
	response.set({
		'Content-Type': 'application/json',
		'X-Frame-Options': 'DENY',
		'X-Content-Type-Options': 'nosniff',
		'X-XSS-Protection': '1; mode=block'
	});
	await next();
});

// health endpoint
app.get('/health', async (request: Request, response: Response, next: NextFunction) => {
	return response.json({
		status: 'I am OK! :)'
	}).status(200);
});

// use routes
app.use('/api/', routes);

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