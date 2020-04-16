import Joi from '@hapi/joi';

const register = Joi.object().keys({
	name: Joi.string().required().min(3),
	email: Joi.string().required().email(),
	password: Joi.string().required().min(6),
	profilePicUrl: Joi.string().optional().uri(),
});

export default register;