import Joi from '@hapi/joi';
import { RoleCode } from '@repository/role/RoleModel';

const register = Joi.object().keys({
  name: Joi.string().required().min(3),
  email: Joi.string().required().email(),
  password: Joi.string().required().min(6),
  profilePicUrl: Joi.string().optional().uri(),
  role: Joi.valid(
    RoleCode.ADMIN.toLowerCase(),
    RoleCode.ADMIN,
    RoleCode.EDITOR.toLowerCase(),
    RoleCode.EDITOR,
    RoleCode.WRITER.toLowerCase(),
    RoleCode.WRITER,
  ).required(),
});

export default register;
