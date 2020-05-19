import express from 'express';
import { SuccessResponse } from '@core/ApiResponse';
import { NoDataError, BadRequestError } from '@core/ApiError';
import blogReposiory from '@repository/blog';
import { Types } from 'mongoose';
import validator, { ValidationSource } from '@utils/validators';
import schema from './schema';
import asyncHandler from '@utils/asyncHandler';
import User from '@repository/user/UserModel';
import logger from '@core/logger';

const router = express.Router();

router.get(
  '/tag/:tag',
  validator(schema.blogTag, ValidationSource.PARAM),
  validator(schema.pagination, ValidationSource.QUERY),
  asyncHandler(async (request, response) => {
    try {
      const tag = request.params.tag;
      const { pageNumber, pageItemCount } = request.query;
      const blogs = await blogReposiory.findByTagAndPaginated(
        tag,
        // @ts-ignore
        parseInt(pageNumber),
        // @ts-ignore
        parseInt(pageItemCount),
      );

      if (!blogs) {
        throw new NoDataError();
      }

      return new SuccessResponse('success', blogs).send(response);
    } catch (error) {
      logger.error(`Failed to get blogs with tag ${request.params.tag}: Err: ${error}`);
      response.status(500).send({ message: error.message });
    }
  }),
);

export default router;
