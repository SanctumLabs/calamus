import express from 'express';
import apikey from '@security/apikey';
import register from './auth/register';
import login from './auth/login';

const router = express.Router();

// allow for registrations to happen without requiring api key validation
// as this is for new registrations
router.use('/v1/register', register);
router.use('/v1/login', login);

// All routes are protected by API key
router.use('/', apikey);

export default router;