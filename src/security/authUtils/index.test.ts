import { validateTokenData, createTokens } from './index';
import { JwtPayload } from '@jwt';
import { tokenInfo } from '@config';
import { Types } from 'mongoose';
import { AuthFailureError } from '@core/ApiError';
import User from '@repository/user/UserModel';

const ACCESS_TOKEN_KEY = 'abc';
const REFRESH_TOKEN_KEY = 'xyz';

describe('authUtils tests', () => {

	beforeAll(() => {
		jest.resetAllMocks();
	});

	it('Should throw error when subject in not user id format', async () => {

		const payload = new JwtPayload(
			tokenInfo.issuer,
			tokenInfo.audience,
			'abc',
			ACCESS_TOKEN_KEY,
			tokenInfo.accessTokenValidityDays
		);

		try {
			validateTokenData(payload);
		} catch (e) {
			expect(e).toBeInstanceOf(AuthFailureError);
		}
	});

	it('Should throw error when access token key is different', async () => {

		const payload = new JwtPayload(
			tokenInfo.issuer,
			tokenInfo.audience,
			new Types.ObjectId().toHexString(),
			'123',
			tokenInfo.accessTokenValidityDays
		);

		try {
			validateTokenData(payload);
		} catch (e) {
			expect(e).toBeInstanceOf(AuthFailureError);
		}
	});

	it('Should return true if all data is correct', async () => {

		const payload = new JwtPayload(
			tokenInfo.issuer,
			tokenInfo.audience,
			new Types.ObjectId().toHexString(), // Random Key
			ACCESS_TOKEN_KEY,
			tokenInfo.accessTokenValidityDays
		);

		const validatedPayload = validateTokenData(payload);

		expect(validatedPayload).toBeTruthy();
	});
});


describe('authUtils createTokens function', () => {

	beforeAll(() => {
		jest.resetAllMocks();
	});

	it('Should process and return accessToken and refreshToken', async () => {

		const userId = new Types.ObjectId(); // Random Key

		const tokens = await createTokens(<User>{ _id: userId }, ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY);

		expect(tokens).toHaveProperty('accessToken');
		expect(tokens).toHaveProperty('refreshToken');
	});
});
