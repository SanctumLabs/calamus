import express from 'express';
import { ProtectedRequest } from 'app-request';
import { AuthFailureError } from '@core/ApiError';
import roleRepository from '@repository/role';
import asyncHandler from '@utils/asyncHandler';

const router = express.Router();

export default router.use(
  asyncHandler(async (request: ProtectedRequest, response, next) => {
    if (!request.user || !request.user.roles || !request.currentRoleCode)
      throw new AuthFailureError('Permission denied');

    const role = await roleRepository.findByCode(request.currentRoleCode);
    if (!role) throw new AuthFailureError('Permission denied');

    const validRoles = request.user.roles.filter(
      (userRole) => userRole._id.toHexString() === role._id.toHexString(),
    );

    if (!validRoles || validRoles.length == 0) throw new AuthFailureError('Permission denied');

    return next();
  }),
);
