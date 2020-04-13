import { Response, NextFunction } from 'express';
import { RoleRequest } from 'types/app-request';
import { RoleCode } from '@repository/role/RoleModel';

export default(roleCode: RoleCode) => {
    (request: RoleRequest, response: Response, next: NextFunction) => {
        request.currentRoleCode = roleCode;
        next();
    };
};