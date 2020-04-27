import path from 'path';
import { readFile } from 'fs';
import { promisify } from 'util';
import { sign, verify } from 'jsonwebtoken';
import logger from '@logger';
import { InternalError, BadTokenError, TokenExpiredError } from '@core/ApiError';
import { JwtException } from './exceptions';
import Role from '@database/repository/role/RoleModel';

/*
 * issuer 		— Software organization who issues the token.
 * subject 		— Intended user of the token.
 * audience 	— Basically identity of the intended recipient of the token.
 * expiresIn	— Expiration time after which the token will be invalid.
 * algorithm 	— Encryption algorithm to be used to protect the token.
 */
export class JwtPayload {
	jti: string;
	aud: string;
	sub: string;
	iss: string;
	iat: number;
	exp: number;
	name: string;
	typ: string;
	roles: Role[];
	nbf: number;

	/**
	 * Creates an instance of JWT Payload which is token based off the JWT specification
	 * which can be found here https://tools.ietf.org/html/rfc7519.
	 * Other keys available in the token are:
	 *
	 * nbf (Not Before) Claim which is used to state that this token is not valid for dates before
	 * the time the token was issued
	 *
	 * exp THe expiry time of the token
	 *
	 * iat The time tht token is issued
	 *
	 * @param {string} jti Uniqu JWT ID used to identify this token
	 * @param {string} issuer Who created and signed this token
	 * @param {string} audience who this token is meant for
	 * @param {string} subject whom the token refers to
	 * @param {string} name Name of token subject
	 * @param {Role[]} roles Roles assigned to user
	 * @param {number} validity Used in calculation of the expiration time of a JWT token
	 * @param {string} type Type of token, will default to Bearer
	 */
	constructor(jti: string, issuer: string, audience: string, subject: string, validity: number, name: string, roles: Role[], type: string = 'Bearer') {
		this.jti = jti;
		this.iss = issuer;
		this.aud = audience;
		this.sub = subject;
		this.iat = Math.floor(Date.now() / 1000);
		this.exp = this.iat + (validity * 24 * 60 * 60);
		this.nbf = this.iat;
		this.name = name;
		this.typ = type;
		this.roles = roles;
	}
}

export default class JWT {

	private static readPublicKey(): Promise<string> {
		try {
			return promisify(readFile)(path.join('./keys/public.pem'), 'utf8');
		} catch (error) {
			logger.error(`Failed to read public key ${error}`);
			throw new Error(`Failed to read file with err ${error.message}`);
		}
	}

	private static readPrivateKey(): Promise<string> {
		try {
			return promisify(readFile)(path.join('./keys/private.pem'), 'utf8');
		} catch (error) {
			logger.error(`Failed to read private key ${error}`);
			throw new Error(`Failed to read file with err ${error.message}`);
		}
    }

	public static async encode(payload: JwtPayload): Promise<string> {
		try {
			const cert = await this.readPrivateKey();
			if (!cert)
				throw new InternalError('Token generation failure');
			// @ts-ignore
			return promisify(sign)({ ...payload }, cert, { algorithm: 'RS256' });
		} catch (error) {
			logger.error(`Failed to encode jwt payload with err ${error.message}`);
			throw new JwtException(`Failed to encode jwt payload with err ${error.message}`);
		}
	}

	/**
	 * This method checks the token and returns the decoded data when token is valid in all respect
	 */
	public static async validate(token: string): Promise<JwtPayload> {
		const cert = await this.readPublicKey();
		try {
			// @ts-ignore
			return <JwtPayload>await promisify(verify)(token, cert);
		} catch (e) {
			if (e && e.name === 'TokenExpiredError') {
				logger.error(`JWT Validation Err: ${e}`);
				throw new TokenExpiredError();
			}
			logger.error(`JWT Validation Err: Token not encrypted ${e}`);
			// throws error if the token has not been encrypted by the private key
			throw new BadTokenError();
		}
	}

	/**
	 * Returns the decoded payload if the signature is valid even if it is expired
	 */
	public static async decode(token: string): Promise<JwtPayload> {
		const cert = await this.readPublicKey();
		try {
			// @ts-ignore
			return <JwtPayload>await promisify(verify)(token, cert, { ignoreExpiration: true });
		} catch (e) {
			logger.debug(e);
			throw new BadTokenError();
		}
	}
}