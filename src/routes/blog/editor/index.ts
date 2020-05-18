import express from 'express';
import idSchema from '../schema';
import validator, { ValidationSource } from '@utils/validators';
import asyncHandler from '@utils/asyncHandler';
import { ProtectedRequest } from 'app-request';
import blogRepository from '@repository/blog';
import { Types } from 'mongoose';
import { BadRequestError, ForbiddenError } from '@core/ApiError';
import { SuccessMsgResponse, SuccessResponse } from '@core/ApiResponse';
import logger from '@logger';

const router = express.Router();

/**
 * Endpoint that allows a user with editor role to publishe a blog.
 */
router.patch(
  '/publish/:id',
  validator(idSchema.blogId, ValidationSource.PARAM),
  asyncHandler(async (request: ProtectedRequest, response) => {
    try {
      const blog = await blogRepository.findBlogAllDataById(new Types.ObjectId(request.params.id));

      if (!blog) {
        throw new BadRequestError('Blog does not exist');
      }

      if (blog.isPublished) {
        throw new BadRequestError('Blog already published');
      }

      blog.isDraft = false;
      blog.isPublished = true;
      blog.isSubmitted = true;
      blog.text = blog.draftText;

      if (!blog.publishedAt) {
        blog.publishedAt = new Date();
      }

      await blogRepository.update(blog);

      new SuccessMsgResponse('Blog published successfully').send(response);
    } catch (error) {
      logger.error(`Encountered error publishing blog ${error}`);
      response.status(500).send({
        error: error.message,
      });
    }
  }),
);

/**
 * Unpublish a blog
 */
router.patch(
  '/unpublish/:id',
  validator(idSchema.blogId, ValidationSource.PARAM),
  asyncHandler(async (request: ProtectedRequest, response) => {
    try {
      const blog = await blogRepository.findBlogAllDataById(new Types.ObjectId(request.params.id));

      if (!blog) {
        throw new BadRequestError('Blog does not exist');
      }

      // if the blog has already been unpublished
      if (!blog.isPublished) {
        throw new BadRequestError('Blog already unpublished');
      }

      blog.isDraft = true;
      blog.isPublished = false;
      blog.isSubmitted = true;

      await blogRepository.update(blog);

      return new SuccessMsgResponse('Blog Unpublished').send(response);
    } catch (error) {
      logger.error(`Failed to unpublish blog ${error}`);
      response.status(500).send({
        message: error.message,
      });
    }
  }),
);

/**
 * Deletes a blog post
 */
router.delete(
  '/:id',
  validator(idSchema.blogId, ValidationSource.PARAM),
  asyncHandler(async (req: ProtectedRequest, res) => {
    try {
      const blog = await blogRepository.findBlogAllDataById(new Types.ObjectId(req.params.id));
      if (!blog) throw new BadRequestError('Blog does not exists');

      blogRepository.delete(blog);

      return new SuccessMsgResponse('Blog deleted successfully').send(res);
    } catch (error) {
      logger.error(`Failed to delete blog ${error}`);
      res.status(500).send({ error: error.message });
    }
  }),
);

export default router;
