import express, { Response } from 'express';
import { SuccessResponse, SuccessMsgResponse } from '@core/ApiResponse';
import { ProtectedRequest, RoleRequest } from 'app-request';
import { BadRequestError, ForbiddenError } from '@core/ApiError';
import blogRepository from '@repository/blog';
import Blog from '@repository/blog/BlogModel';
import { Types } from 'mongoose';
import validator, { ValidationSource } from '@utils/validators';
import schema from './schema';
import asyncHandler from '@utils/asyncHandler';
import _ from 'lodash';
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

export default router;
