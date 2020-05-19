import Joi from '@hapi/joi';
import { JoiObjectId, JoiUrlEndpoint } from '@utils/validators';

export default {
  blogId: Joi.object().keys({
    id: JoiObjectId().required(),
  }),
  blogSlug: Joi.object().keys({
    slug: JoiUrlEndpoint().required().max(200),
  }),
};
