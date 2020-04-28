import express from 'express';
import register from './auth/register';
import deregister from './auth/deregister';
import login from './auth/login';
import token from './auth/token';
import writer from './blog/writer';
import profile from './profile';
import authentication from '@authentication';
import role from '@utils/role';
import { RoleCode } from '@repository/role/RoleModel';
import authorization from '@authorization';

const router = express.Router();

// allow for registrations to happen without requiring api key validation
// as this is for new registrations
router.use('/v1/register', register);
router.use('/v1/deregister', authentication, deregister);
router.use('/v1/login', login);
router.use('/v1/token', token);

router.use('/v1/token', token);
router.use('/v1/profile', profile);

router.use('/v1/writer/blog', authentication, role(RoleCode.WRITER), authorization, writer);
export default router;
