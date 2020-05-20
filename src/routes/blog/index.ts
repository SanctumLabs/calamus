import express, { Request } from 'express';
import { SuccessResponse } from '@core/ApiResponse';
import { BadRequestError } from '@core/ApiError';
import blogRepository from '@repository/blog';
import { Types } from 'mongoose';
import validator, { ValidationSource } from '@utils/validators';
import schema from './schema';
import asyncHandler from '@utils/asyncHandler';
import logger from '@logger';

const router = express.Router();

/**
 * Get a blog by its slug
 */
router.get(
  '',
  validator(schema.blogSlug, ValidationSource.QUERY),
  asyncHandler(async (req: Request, res) => {
    try {
      // @ts-ignore
      const blog = await blogRepository.findBySlug(req.query.slug);
      if (!blog) throw new BadRequestError('Blog does not exist');
      new SuccessResponse('success', blog).send(res);
    } catch (error) {
      logger.error(`Failed with error ${error}`);
      res.status(500).send({ message: error.message });
    }
  }),
);

/**
 * Get a blog by ID
 */
router.get(
  '/:id',
  validator(schema.blogId, ValidationSource.PARAM),
  asyncHandler(async (req, res) => {
    try {
      const blog = await blogRepository.findInfoWithTextById(new Types.ObjectId(req.params.id));
      if (!blog) throw new BadRequestError('Blog do not exists');
      return new SuccessResponse('success', blog).send(res);
    } catch (error) {
      logger.error(`Failed to get blog by id ${error}`);
      res.status(500).send({ message: error.message });
    }
  }),
);

export default router;
