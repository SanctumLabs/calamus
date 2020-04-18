import User from '@repository/user/UserModel';
import { Types } from 'mongoose';
import JWT, { JwtPayload } from '@jwt';
import { BadTokenError } from '@core/ApiError';
import Keystore from '@repository/keystore/KeystoreModel';
import * as authUtils from '@security/authUtils';
import { tokenInfo } from '@config';

const API_KEY = 'random-api-key';
export const ACCESS_TOKEN = 'xyz';

export const USER_ID = new Types.ObjectId(); // random id with object id format
export const getAccessTokenSpy = jest.spyOn(authUtils, 'getAccessToken');

export const mockUserFindById = jest.fn(async (id: Types.ObjectId) => {
	if (USER_ID.equals(id)) return <User>{ _id: new Types.ObjectId(id) };
	else return null;
});

export const mockJwtValidate = jest.fn(
	async (token: string): Promise<JwtPayload> => {
		if (token === ACCESS_TOKEN) return <JwtPayload>{
			iss: tokenInfo.issuer,
			aud: tokenInfo.audience,
			sub: USER_ID.toHexString(),
			iat: 1,
			exp: 2,
			name: 'name'
		};
		throw new BadTokenError();
	});

export const mockKeystoreFindForKey = jest.fn(
	async (client: User, key: string): Promise<Keystore> => (<Keystore>{ client: client, primaryKey: key }));

jest.mock('@repository/user', () => ({
	get findById() { return mockUserFindById; }
}));

jest.mock('@repository/keystore', () => ({
	get findforKey() { return mockKeystoreFindForKey; }
}));

JWT.validate = mockJwtValidate;

export const addHeaders = (request: any) => request
	.set('Content-Type', 'application/json')
	.set('api-key', API_KEY);

export const addAuthHeaders = (request: any, accessToken = ACCESS_TOKEN) => request
	.set('Content-Type', 'application/json')
	.set('Authorization', `Bearer ${accessToken}`)
	.set('api-key', API_KEY);
