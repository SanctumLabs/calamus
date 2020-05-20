import express, { response } from 'express';
import { SuccessResponse } from '@core/ApiResponse';
import { NoDataError, BadRequestError } from '@core/ApiError';
import blogRepository from '@repository/blog';
import { Types } from 'mongoose';
import validator, { ValidationSource } from '@utils/validators';
import schema from './schema';
import asyncHandler from '@utils/asyncHandler';
import User from '@repository/user/UserModel';
import logger from '@core/logger';

const router = express.Router();

/**
 * Get blogs by given tag
 */
router.get(
  '/tag/:tag',
  validator(schema.blogTag, ValidationSource.PARAM),
  validator(schema.pagination, ValidationSource.QUERY),
  asyncHandler(async (request, response) => {
    try {
      const tag = request.params.tag;
      const { pageNumber, pageItemCount } = request.query;
      const blogs = await blogRepository.findByTagAndPaginated(
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

/**
 * Get blogs by the given author
 */
router.get(
  '/author/:id',
  validator(schema.authorId, ValidationSource.PARAM),
  asyncHandler(async (request, response) => {
    try {
      const blogs = await blogRepository.findAllPublishedForAuthor({
        id: new Types.ObjectId(request.params.id),
      } as User);

      if (!blogs) {
        throw new NoDataError();
      }

      return new SuccessResponse('success', blogs).send(response);
    } catch (error) {
      logger.error(`Error getting blogs for author ${request.params.id}, ${error}`);
      response.status(500).send({ message: 'Error getting blogs for author' });
    }
  }),
);

/**
 * Get all the latest blogs
 */
router.get(
  '/latest',
  validator(schema.pagination, ValidationSource.QUERY),
  asyncHandler(async (req, res) => {
    try {
      const blogs = await blogRepository.findLatestBlogs(
        // @ts-ignore
        parseInt(req.query.pageNumber),
        // @ts-ignore
        parseInt(req.query.pageItemCount),
      );

      if (!blogs) throw new NoDataError();

      return new SuccessResponse('success', blogs).send(res);
    } catch (error) {
      logger.error(`Failed to fetch latest blogs ${error}`);
      response.status(500).send({ message: error.message });
    }
  }),
);

export default router;
