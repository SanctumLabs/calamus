import { mockUserFindByEmail } from '../login/mock';
import User from '@repository/user/UserModel';
import Keystore from '@repository/keystore/KeystoreModel';
import { Types } from 'mongoose';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

export const USER_NAME = 'abc';
export const USER_PROFILE_PIC = 'https://abc.com/xyz';

export const bcryptHashSpy = jest.spyOn(bcrypt, 'hash');

export const mockUserCreate = jest.fn(
  async (user: User): Promise<{ user: User; keystore: Keystore }> => {
    user._id = new Types.ObjectId();
    user.roles = [];
    return {
      user: user,
      keystore: {
        _id: new Types.ObjectId(),
        client: user,
        primaryKey: 'abc',
        secondaryKey: 'xyz',
      } as Keystore,
    };
  },
);

export const cryptoRandomBytesSpy = jest.spyOn(crypto, 'randomBytes');

jest.mock('@repository/user', () => ({
  get findByEmail() {
    return mockUserFindByEmail;
  }, // utilising already defined mock
  get create() {
    return mockUserCreate;
  },
}));
