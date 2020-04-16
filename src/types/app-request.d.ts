import { Request } from 'express';
import User from '@repository/user/UserModel';
import Keystore from '@repository/keystore/KeystoreModel';

declare interface PublicRequest extends Request {
	apiKey: string;
}

declare interface RoleRequest extends Request {
	currentRoleCode: string;
}

declare interface ProtectedRequest extends RoleRequest, PublicRequest {
	user: User;
	accessToken: string;
	keystore: Keystore;
}

declare interface Tokens {
	accessToken: string;
	refreshToken: string;
}