import Joi from '@hapi/joi';
import { JoiAuthBearer } from '@utils/validators';

export default {
  auth: Joi.object()
    .keys({
      authorization: JoiAuthBearer().required(),
    })
    .unknown(true),
  refreshToken: Joi.object().keys({
    refreshToken: Joi.string().required().min(1),
  }),
};
