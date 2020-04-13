import express from 'express';
import schema from '../schema';
import apiKeyRepository from '@repository/apikey';
import { ForbiddenError } from '@core/ApiError';
import logger from '@logger';
import validator, { ValidationSource } from '@utils/validators';
import asyncHandler from '@utils/asyncHandler';
import { PublicRequest } from 'app-request';

const router = express.Router();

/**
 * This is used to validate each request and check if the api key can be found
 * in the database. Throws a ForbiddenError if the api key can't be found
 */
export default router.use(validator(schema.apiKey, ValidationSource.HEADER),
    asyncHandler(async (request: PublicRequest, res, next) => {
        request.apiKey = request.headers['api-key'].toString();
        const apiKey = await apiKeyRepository.findByKey(request.apiKey);

        logger.info(`Found API Key ${apiKey}`);

        if (!apiKey) {
            throw new ForbiddenError();
        }

        return next();
    })
);