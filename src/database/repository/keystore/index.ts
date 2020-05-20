import Keystore, { KeystoreModel } from './KeystoreModel';
import { Types } from 'mongoose';
import User from '@database/repository/user/UserModel';
import logger from '@core/logger';

export default class KeystoreRepository {
  public static findforKey(client: User, key: string): Promise<Keystore> {
    return KeystoreModel.findOne({ client: client, primaryKey: key, status: true }).exec();
  }

  public static findForUser(client: User): Promise<Keystore> {
    return KeystoreModel.findOne({ client, status: true }).exec();
  }

  public static updateKeys(keystore: Keystore, primaryKey: string, secondaryKey: string) {
    logger.debug(`Updating Keystore ${keystore._id}`);

    const now = new Date();

    keystore.primaryKey = primaryKey;
    keystore.secondaryKey = secondaryKey;
    keystore.updatedAt = now;

    KeystoreModel.updateOne({ _id: keystore._id }, keystore, (err, result) => {
      if (err) {
        logger.error(`Failed with err ${err}`);
      } else {
        logger.debug(`Modified ${result.nModified} Keystore`);
      }
    });
  }

  public static remove(id: Types.ObjectId): Promise<Keystore> {
    return KeystoreModel.findByIdAndRemove(id).lean<Keystore>().exec();
  }

  public static find(client: User, primaryKey: string, secondaryKey: string): Promise<Keystore> {
    return KeystoreModel.findOne({
      client: client,
      primaryKey: primaryKey,
      secondaryKey: secondaryKey,
    })
      .lean<Keystore>()
      .exec();
  }

  public static async create(
    client: User,
    primaryKey: string,
    secondaryKey: string,
  ): Promise<Keystore> {
    const now = new Date();
    const keystore = await KeystoreModel.create({
      client: client,
      primaryKey: primaryKey,
      secondaryKey: secondaryKey,
      createdAt: now,
      updatedAt: now,
    } as Keystore);
    return keystore.toObject();
  }
}
