import express from 'express';
import register from './auth/register';
import deregister from './auth/deregister';
import login from './auth/login';
import authentication from '@security/authentication';

const router = express.Router();

// allow for registrations to happen without requiring api key validation
// as this is for new registrations
router.use('/v1/register', register);
router.use('/v1/deregister', authentication, deregister);
router.use('/v1/login', login);

router.use('/v1/token', authentication);

export default router;