import express, { Response } from 'express';
import { SuccessResponse, SuccessMsgResponse } from '@core/ApiResponse';
import { ProtectedRequest, RoleRequest } from 'app-request';
import { BadRequestError, ForbiddenError } from '@core/ApiError';
import blogRepository from '@repository/blog';
import Blog from '@repository/blog/BlogModel';
import { Types } from 'mongoose';
import validator, { ValidationSource } from '@utils/validators';
import schema from './schema';
import idSchema from '../schema';
import asyncHandler from '@utils/asyncHandler';
import logger from '@logger';

const router = express.Router();

/**
 * Util helper function that formats and cleans an endpoint
 * @param {string} endpoint Endpoint URL
 * @returns {string} Formatted endpoint
 */
const formatEndpoint = (endpoint: string) => endpoint.replace(/\s/g, '').replace(/\//g, '-');

/**
 * Endpoint to create a blog
 */
router.post(
  '/',
  validator(schema.blogCreate),
  asyncHandler(async (request: ProtectedRequest, response: Response) => {
    try {
      request.body.slug = formatEndpoint(request.body.slug);

      const blog = await blogRepository.findUrlIfExists(request.body.slug);

      if (blog) {
        throw new BadRequestError('Blog with this slug already exists');
      }

      const createdBlog = await blogRepository.create({
        title: request.body.title,
        description: request.body.description,
        draftText: request.body.text,
        tags: request.body.tags,
        author: request.user,
        slug: request.body.slug,
        imgUrl: request.body.imgUrl,
        createdBy: request.user,
        updatedBy: request.user,
      } as Blog);

      new SuccessResponse('Blog created successfully', createdBlog).send(response);
    } catch (error) {
      logger.error(`Error encountered while creating blog ${error}`);
      response.send({
        message: error.message,
      });
    }
  }),
);

router.patch(
  '/:id',
  validator(idSchema.blogId, ValidationSource.PARAM),
  validator(schema.update),
  asyncHandler(async (request: ProtectedRequest, response) => {
    try {
      const blog = await blogRepository.findBlogAllDataById(new Types.ObjectId(request.params.id));

      if (!blog) {
        throw new BadRequestError('Blog does not exist');
      }

      if (!blog.author._id.equals(request.user._id)) {
        throw new ForbiddenError('You do not have the necessary permissions');
      }

      if (request.body.slug) {
        const endpoint = formatEndpoint(request.body.slug);

        const existingSlug = await blogRepository.findBySlug(endpoint);

        if (existingSlug) {
          throw new BadRequestError('Blog Slug already used');
        }

        blog.slug = endpoint;
      }

      // only update the requred fields if available
      if (request.body.title) blog.title = request.body.title;
      if (request.body.description) blog.description = request.body.description;
      if (request.body.text) blog.draftText = request.body.text;
      if (request.body.tags) blog.tags = request.body.tags;
      if (request.body.imgUrl) blog.imgUrl = request.body.imgUrl;

      await blogRepository.update(blog);

      new SuccessResponse('Blog updated successfully', blog).send(response);
    } catch (error) {
      logger.error(`Failed to update blog Err: ${error}`);
      response.send({
        error: error.message,
      });
    }
  }),
);

export default router;
