import express, { Request } from 'express';
import { SuccessResponse } from '@core/ApiResponse';
import userRepository from '@repository/user';
import { ProtectedRequest } from 'app-request';
import { BadRequestError } from '@core/ApiError';
import { Types } from 'mongoose';
import validator, { ValidationSource } from '@utils/validators';
import schema from './schema';
import asyncHandler from '@utils/asyncHandler';
import pick from 'lodash/pick';
import authentication from '@security/authentication';
import logger from '@logger';

const router = express.Router();

/**
 * Endpoint to get public profile for the given id
 */
router.get(
    '/public/id/:id',
    validator(schema.userId, ValidationSource.PARAM),
    asyncHandler(async (request: ProtectedRequest, response) => {
        try {
            const user = await userRepository.findPublicProfileById(new Types.ObjectId(request.params.id));

            if (!user) {
                throw new BadRequestError('User not registered');
            }

            return new SuccessResponse('success', pick(user, ['name', 'profilePicUrl'])).send(response);
        } catch (error) {
            logger.error(`Failed to get public profile of user ${request.params.id} with err ${error}`);
            response.send({
                message: error.message
            });
        }
    })
);


export default router;