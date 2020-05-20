import { readFileSpy } from './mock';
import JWT, { JwtPayload } from './JWT';
import { BadTokenError, TokenExpiredError } from '@core/ApiError';
import Role from '@database/repository/role/RoleModel';

describe('JWT class tests', () => {
  const jti = 'jti';
  const issuer = 'issuer';
  const audience = 'audience';
  const subject = 'subject';
  const name = 'name';
  const validity = 1;
  const roles: Role[] = [];

  it('Should throw error for invalid token in JWT.decode', async () => {
    beforeEach(() => {
      readFileSpy.mockClear();
    });

    try {
      await JWT.decode('abc');
    } catch (e) {
      expect(e).toBeInstanceOf(BadTokenError);
    }

    expect(readFileSpy).toBeCalledTimes(1);
  });

  it('Should generate a token for JWT.encode', async () => {
    beforeEach(() => {
      readFileSpy.mockClear();
    });

    const payload = new JwtPayload(jti, issuer, audience, subject, validity, name, roles);
    const token = await JWT.encode(payload);

    expect(typeof token).toBe('string');
    expect(readFileSpy).toBeCalledTimes(1);
  });

  it('Should decode a valid token for JWT.decode', async () => {
    beforeEach(() => {
      readFileSpy.mockClear();
    });

    const payload = new JwtPayload(jti, issuer, audience, subject, validity, name, roles);
    const token = await JWT.encode(payload);
    const decoded = await JWT.decode(token);

    expect(decoded).toMatchObject(payload);
    expect(readFileSpy).toBeCalledTimes(2);
  });

  it('Should parse an expired token for JWT.decode', async () => {
    beforeEach(() => {
      readFileSpy.mockClear();
    });

    const time = Math.floor(Date.now() / 1000);

    const payload = {
      jti,
      aud: audience,
      sub: subject,
      iss: issuer,
      iat: time,
      exp: time,
      name,
      roles,
    } as JwtPayload;
    const token = await JWT.encode(payload);
    const decoded = await JWT.decode(token);

    expect(decoded).toMatchObject(payload);
    expect(readFileSpy).toBeCalledTimes(2);
  });

  it('Should throw error for invalid token in JWT.validate', async () => {
    beforeEach(() => {
      readFileSpy.mockClear();
    });

    try {
      await JWT.validate('abc');
    } catch (e) {
      expect(e).toBeInstanceOf(BadTokenError);
    }

    expect(readFileSpy).toBeCalledTimes(1);
  });

  it('Should validate a valid token for JWT.validate', async () => {
    beforeEach(() => {
      readFileSpy.mockClear();
    });

    const payload = new JwtPayload(jti, issuer, audience, subject, validity, name, roles);
    const token = await JWT.encode(payload);
    const decoded = await JWT.validate(token);

    expect(decoded).toMatchObject(payload);
    expect(readFileSpy).toBeCalledTimes(2);
  });

  it('Should validate a token expiry for JWT.validate', async () => {
    beforeEach(() => {
      readFileSpy.mockClear();
    });

    const time = Math.floor(Date.now() / 1000);

    const payload = {
      jti,
      aud: audience,
      sub: subject,
      iss: issuer,
      iat: time,
      exp: time,
      name,
      roles,
    } as JwtPayload;
    const token = await JWT.encode(payload);
    try {
      await JWT.validate(token);
    } catch (e) {
      expect(e).toBeInstanceOf(TokenExpiredError);
    }
    expect(readFileSpy).toBeCalledTimes(2);
  });
});
