import { Tokens } from 'app-request';
import { AuthFailureError, InternalError } from '@core/ApiError';
import { Types } from 'mongoose';
import User from '@database/repository/user/UserModel';
import { tokenInfo } from '@config';
import JWT, { JwtPayload } from '@jwt';
import logger from '@logger';

/**
 * This gets the access token from the header
 * @param {string} authorization Authorization header
 * @returns {string} Access token
 */
export const getAccessToken = (authorization: string): string => {
    if (!authorization) {
        throw new AuthFailureError('Invalid authorization');
    }
    if (!authorization.startsWith('Bearer ')) {
        throw new AuthFailureError('Invalid Authorization');
    }
    return authorization.split(' ')[1];
};

export const validateTokenData = (payload: JwtPayload): boolean => {
    if (!payload || !payload.iss || !payload.sub || !payload.aud || !payload.prm
		|| payload.iss !== tokenInfo.issuer
		|| payload.aud !== tokenInfo.audience
		|| !Types.ObjectId.isValid(payload.sub))
		throw new AuthFailureError('Invalid Access Token');
	return true;
};

export const createTokens = async (user: User, accessTokenKey: string, refreshTokenKey: string)
	: Promise<Tokens> => {
		try {
			const accessToken = await JWT.encode(
				new JwtPayload(
					tokenInfo.issuer,
					tokenInfo.audience,
					user._id.toString(),
					accessTokenKey,
					tokenInfo.accessTokenValidityDays));

			if (!accessToken) throw new InternalError();

			const refreshToken = await JWT.encode(
				new JwtPayload(
					tokenInfo.issuer,
					tokenInfo.audience,
					user._id.toString(),
					refreshTokenKey,
					tokenInfo.refreshTokenValidityDays));

			if (!refreshToken) throw new InternalError();

			return <Tokens>{
				accessToken: accessToken,
				refreshToken: refreshToken
			};
		} catch (error) {
			logger.error(`Failed to create tokens with error ${error}`);
			throw new InternalError();
		}
};