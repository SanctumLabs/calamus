import Joi from '@hapi/joi';
import { JoiObjectId } from '@utils/validators';

export default {
  blogId: Joi.object().keys({
    id: JoiObjectId().required(),
  }),
};
