import Joi from '@hapi/joi';
import { Request, Response, NextFunction } from 'express';
import logger from '@logger';
import { BadRequestError } from '@core/ApiError';
import { Types } from 'mongoose';

export enum ValidationSource {
  BODY = 'body',
  HEADER = 'headers',
  QUERY = 'query',
  PARAM = 'params',
}

/**
 * Object ID validation helper
 */
export const JoiObjectId = () =>
  Joi.string().custom((value: string, helpers) => {
    if (!Types.ObjectId.isValid(value)) {
      return helpers.error('any.invalid');
    }
  }, 'Object ID Validation');

/**
 * URL endpoint validation
 */
export const JoiUrlEndpoint = () =>
  Joi.string().custom((value: string, helpers) => {
    if (value.includes('://')) return helpers.error('any.invalid');
    return value;
  }, 'Url Endpoint Validation');

/**
 * Auth Bearer validator
 */
export const JoiAuthBearer = () =>
  Joi.string().custom((value: string, helpers) => {
    if (!value.startsWith('Bearer ')) {
      return helpers.error('any.invalid');
    }

    if (!value.split(' ')[1]) {
      return helpers.error('any.invalid');
    }

    return value;
  }, 'Authorization Header Validation');

export default (schema: Joi.ObjectSchema, source: ValidationSource = ValidationSource.BODY) => (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { error } = schema.validate(req[source]);

    if (!error) return next();

    const { details } = error;
    const message = details.map((i) => i.message.replace(/['"]+/g, '')).join(',');
    logger.error(`ValidationError: ${message}`);

    next(new BadRequestError(message));
  } catch (error) {
    next(error);
  }
};
