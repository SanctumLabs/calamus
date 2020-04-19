import express, { Response } from 'express';
import { TokenRefreshResponse } from '@core/ApiResponse';
import { ProtectedRequest } from 'app-request';
import { Types } from 'mongoose';
import userRepository from '@repository/user';
import { AuthFailureError } from '@core/ApiError';
import JWT from '@jwt';
import keystoreRepository from '@repository/keystore';
import crypto from 'crypto';
import { validateTokenData, createTokens, getAccessToken } from '@authUtils';
import validator, { ValidationSource } from '@utils/validators';
import schema from './schema';
import asyncHandler from '@utils/asyncHandler';
import logger from '@core/logger';

const router = express.Router();

router.post(
    '/refresh',
    validator(schema.auth, ValidationSource.HEADER),
    validator(schema.refreshToken),
    asyncHandler(async (request: ProtectedRequest, response: Response) => {
        try {
            // express auto converts headers to lowercase
            request.accessToken = getAccessToken(request.headers.authorization);

            // decode and validate token data
            const accessTokenPayload = await JWT.decode(request.accessToken);
            validateTokenData(accessTokenPayload);

            // get the user from the subject of the decoded JWT token
            const user = await userRepository.findById(new Types.ObjectId(accessTokenPayload.sub));

            // if the user is non-existent
            if (!user) {
                throw new AuthFailureError('User not registered');
            }

            request.user = user;

            // decode and validate refresh token
            const refreshTokenPayload = await JWT.decode(request.body.refreshToken);
            validateTokenData(refreshTokenPayload);

            // check if these tokens belong to the same user(subject)
            if (accessTokenPayload.sub !== refreshTokenPayload.sub) {
                logger.debug(`Subject on AccessToken & RefreshToken don't match`);
                throw new AuthFailureError('Invalid Access token');
            }

            // check that we have a unique keystore for this given user based on their id
            // and the JWT ID generated during registration
            const keystore = await keystoreRepository.find(
                request.user._id,
                accessTokenPayload.jti,
                refreshTokenPayload.jti
            );

            if (!keystore) {
                logger.debug(`Keystore not found`);
                throw new AuthFailureError('Invalid Access Token');
            }

            // we remove this keystore and generate another one
            await keystoreRepository.remove(keystore._id);

            const accessTokenKey = crypto.randomBytes(64).toString('hex');
            const refreshTokenKey = crypto.randomBytes(64).toString('hex');

            await keystoreRepository.create(request.user._id, accessTokenKey, refreshTokenKey);

            // create new tokens
            const tokens = await createTokens(request.user, accessTokenKey, refreshTokenKey);

            new TokenRefreshResponse('Token Issued', tokens.accessToken, tokens.refreshToken).send(response);
        } catch (error) {
            logger.error(`Failed to refresh token with error ${error}`);
            response.status(500).send({
                message: error.message
            });
        }
    })
);

export default router;