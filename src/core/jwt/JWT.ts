import path from 'path';
import { readFile } from 'fs';
import { promisify } from 'util';
import { sign, verify } from 'jsonwebtoken';
import logger from '@logger';
import { InternalError, BadTokenError, TokenExpiredError } from '@core/ApiError';
import { JwtException } from './exceptions';

/*
 * issuer 		— Software organization who issues the token.
 * subject 		— Intended user of the token.
 * audience 	— Basically identity of the intended recipient of the token.
 * expiresIn	— Expiration time after which the token will be invalid.
 * algorithm 	— Encryption algorithm to be used to protect the token.
 */
export class JwtPayload {
	aud: string;
	sub: string;
	iss: string;
	iat: number;
	exp: number;
	prm: string;

	constructor(issuer: string, audience: string, subject: string, param: string, validity: number) {
		this.iss = issuer;
		this.aud = audience;
		this.sub = subject;
		this.iat = Math.floor(Date.now() / 1000);
		this.exp = this.iat + (validity * 24 * 60 * 60);
		this.prm = param;
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
			logger.debug(e);
			if (e && e.name === 'TokenExpiredError') throw new TokenExpiredError();
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