import Joi from '@hapi/joi';
import { JoiUrlEndpoint } from '@utils/validators';

export default {
  blogCreate: Joi.object().keys({
    title: Joi.string().required().min(3).max(500),
    description: Joi.string().required().min(3).max(2000),
    text: Joi.string().required().max(50000),
    slug: JoiUrlEndpoint().required().max(200),
    imgUrl: Joi.string().optional().uri().max(200),
    tags: Joi.array().optional().min(1).items(Joi.string().uppercase()),
  }),
  update: Joi.object().keys({
    title: Joi.string().optional().min(3).max(500),
    description: Joi.string().optional().min(3).max(2000),
    text: Joi.string().optional().max(50000),
    slug: JoiUrlEndpoint().optional().max(200),
    imgUrl: Joi.string().optional().uri().max(200),
    tags: Joi.array().optional().min(1).items(Joi.string().uppercase()),
  }),
};
