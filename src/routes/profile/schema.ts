import Joi from '@hapi/joi';
import { JoiObjectId } from '@utils/validators';

export default {
  userId: Joi.object().keys({
    id: JoiObjectId().required(),
  }),
  username: Joi.object().keys({
    name: Joi.string().optional().min(3).max(200),
  }),
  profile: Joi.object().keys({
    name: Joi.string().optional().min(3).max(200),
    profilePicUrl: Joi.string().optional().uri(),
  }),
};
