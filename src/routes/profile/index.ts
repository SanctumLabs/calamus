import express, { Response } from 'express';
import { SuccessResponse, SuccessMsgResponse } from '@core/ApiResponse';
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
      const user = await userRepository.findPublicProfileById(
        new Types.ObjectId(request.params.id),
      );

      if (!user) {
        throw new BadRequestError('User not registered');
      }

      return new SuccessResponse('success', pick(user, ['name', 'profilePicUrl'])).send(response);
    } catch (error) {
      logger.error(`Failed to get public profile of user ${request.params.id} with err ${error}`);
      response.send({
        message: error.message,
      });
    }
  }),
);

/**
 * Endpoint to get public profile for the given name
 */
router.get(
  '/public/u/:name',
  validator(schema.username, ValidationSource.PARAM),
  asyncHandler(async (request: ProtectedRequest, response) => {
    try {
      const user = await userRepository.findPublicProfileByName(request.params.name);

      if (!user) {
        throw new BadRequestError('User not registered');
      }

      return new SuccessResponse('success', pick(user, ['name', 'profilePicUrl'])).send(response);
    } catch (error) {
      logger.error(`Failed to get public profile of user ${request.params.name} with err ${error}`);
      response.send({
        message: error.message,
      });
    }
  }),
);

/*-------------------------------------------------------------------------*/
// Below all APIs are private APIs protected for Access Token
router.use('/', authentication);
/*-------------------------------------------------------------------------*/

/**
 * Private access to profile
 */
router.get(
  '/my',
  asyncHandler(async (request: ProtectedRequest, response: Response) => {
    try {
      const user = await userRepository.findProfileById(request.user._id);

      if (!user) {
        throw new BadRequestError('User not registered');
      }

      return new SuccessResponse('success', pick(user, ['name', 'profilePicUrl', 'roles'])).send(
        response,
      );
    } catch (error) {
      logger.error(`Failed to get profile ${error}`);
      response.status(500).send({
        message: error.message,
      });
    }
  }),
);

/**
 * Updates a profile of the user
 */
router.patch(
  '/',
  validator(schema.profile),
  asyncHandler(async (req: ProtectedRequest, res) => {
    try {
      // if there is no body
      if (!req.body.name && !req.body.profilePicUrl) {
        logger.info(`Nothing to update for user ${req.user._id}`);
        return new SuccessMsgResponse('Nothing to update').send(res);
      }

      const user = await userRepository.findProfileById(req.user._id);

      if (!user) {
        logger.error(`User ${req.user._id} does not exist`);
        throw new BadRequestError('User not registered');
      }

      if (req.body.name) {
        user.name = req.body.name;
      }

      if (req.body.profilePicUrl) {
        user.profilePicUrl = req.body.profilePicUrl;
      }

      logger.info(`Updating profile for user ${req.user._id}`);

      await userRepository.updateInfo(user);

      return new SuccessResponse(
        'Profile updated',
        pick(user, ['name', 'profilePicUrl', 'roles']),
      ).send(res);
    } catch (error) {
      logger.error(`Failed to update profile ${error}`);
      res.status(500).send({
        message: error.message,
      });
    }
  }),
);

export default router;
