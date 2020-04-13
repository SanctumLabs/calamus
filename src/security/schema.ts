import Joi from '@hapi/joi';
import { JoiAuthBearer } from '@utils/validators';

export default {
    apiKey: Joi.object().keys({
        'api-key': Joi.string().required()
    }).unknown(true),
    auth: Joi.object().keys({
        'authorization': JoiAuthBearer().required()
    }).unknown(true)
};