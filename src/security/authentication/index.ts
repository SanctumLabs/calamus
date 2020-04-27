import express from 'express';
import { ProtectedRequest } from 'app-request';
import userRepository from '@repository/user';
import { AuthFailureError, AccessTokenError, TokenExpiredError } from '@core/ApiError';
import keystoreRepository from '@repository/keystore';
import { Types } from 'mongoose';
import validator, { ValidationSource } from '@utils/validators';
import schema from '../schema';
import asyncHandler from '@utils/asyncHandler';
import JWT from '@jwt';
import { getAccessToken, validateTokenData } from '@authUtils';
import logger from '@logger';

const router = express.Router();

/**
 * Checks if a user is authenticated before they can access a route
 */
export default router.use(
    validator(schema.auth, ValidationSource.HEADER),
    asyncHandler(async (request: ProtectedRequest, response, next) => {
        request.accessToken = getAccessToken(request.headers.authorization);

        try {
            const payload = await JWT.validate(request.accessToken);
            validateTokenData(payload);

            const user = await userRepository.findById(new Types.ObjectId(payload.sub));

            if (!user) {
                throw new AuthFailureError('User not registered');
            }

            request.user = user;

            const keystore = await keystoreRepository.findforKey(request.user._id, payload.jti);

            if (!keystore) {
                throw new AuthFailureError('Invalid access token');
            }

            // @ts-ignore
            request.keystore = keystore;

            return next();
        } catch (error) {
            logger.error(`Auth Failed error: ${error}`);
            if (error instanceof TokenExpiredError) {
                throw new AccessTokenError(error.message);
            }
            throw new Error(error.message);
        }
    })
);