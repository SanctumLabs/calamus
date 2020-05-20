import express, { Response } from 'express';
import asyncHandler from '@utils/asyncHandler';
import { ProtectedRequest } from 'app-request';
import userRepository from '@repository/user';
import { BadRequestError } from '@core/ApiError';
import { SuccessMsgResponse } from '@core/ApiResponse';
import logger from '@core/logger';
import KeystoreRepository from '@database/repository/keystore';

const router = express.Router();

/**
 * Deregister users
 */
router.delete(
  '',
  asyncHandler(async (req: ProtectedRequest, res: Response) => {
    try {
      const user = await userRepository.findByEmail(req.user.email);

      if (!user) {
        logger.error(`User with email ${req.user.email} not found`);
        throw new BadRequestError('User does not exist');
      }

      logger.warn(`Deleting user ${req.user.email} ...`);

      await KeystoreRepository.remove(req.keystore._id);
      await userRepository.removeUser(req.user);

      new SuccessMsgResponse('User deregistered').send(res);
    } catch (error) {
      logger.error(`Failed with ${error}`);
      res.status(400).send({
        message: error.message,
      });
    }
  }),
);

export default router;
