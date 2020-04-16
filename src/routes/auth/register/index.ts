import express from 'express';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import pick from 'lodash/pick';
import validator from '@utils/validators';
import asyncHandler from '@utils/asyncHandler';
import { RoleRequest } from 'app-request';
import schema from './schema';
import userRepository from '@repository/user';
import User from '@repository/user/UserModel';
import { BadRequestError } from '@core/ApiError';
import { RoleCode } from '@repository/role/RoleModel';
import { createTokens } from '@authUtils';
import { SuccessResponse, InternalErrorResponse } from '@core/ApiResponse';
import logger from '@core/logger';

const router = express.Router();

router.post('',
    validator(schema),
    asyncHandler(async (request: RoleRequest, res, next) => {
        try {
            const user = await userRepository.findByEmail(request.body.email);

            if (user) {
                throw new BadRequestError('User already exists');
            }

            const accessTokenKey = crypto.randomBytes(64).toString('hex');
            const refreshTokenKey = crypto.randomBytes(64).toString('hex');
            const passwordHash = await bcrypt.hash(request.body.password, 10);

            // create this user as an admin
            const { user: createdUser, keystore } = await userRepository.create(<User>{
                name: request.body.name,
                email: request.body.email,
                profilePicUrl: request.body.profilePicUrl,
                password: passwordHash
            }, accessTokenKey, refreshTokenKey, RoleCode.ADMIN);

            try {
                const tokens = await createTokens(createdUser, keystore.primaryKey, keystore.secondaryKey);
                new SuccessResponse('Registration successful', {
                    user: pick(createdUser, ['_id', 'name', 'email', 'roles', 'profilePicUrl']),
                    tokens
                }).send(res).status(201);
            } catch (error) {
                logger.error(`Failed to register user with err ${error}`);
                new InternalErrorResponse().send(res);
            }

        } catch (error) {
            logger.error(`Failed with ${error}`);
            res.status(409).send(
                {
                    'message': error.message
                }
            );
        }
    })
);

export default router;