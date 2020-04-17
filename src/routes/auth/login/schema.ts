import Joi from '@hapi/joi';

const userCredential = Joi.object().keys({
	email: Joi.string().required().email(),
	password: Joi.string().required().min(6),
});

export default userCredential;