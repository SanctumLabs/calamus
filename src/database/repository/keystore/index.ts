import Keystore, { KeystoreModel } from './KeystoreModel';
import { Types } from 'mongoose';
import User from '@database/repository/user/UserModel';

export default class KeystoreRepository {

	public static findforKey(client: User, key: string): Promise<Keystore> {
		return KeystoreModel.findOne({ client: client, primaryKey: key, status: true }).exec();
	}

	public static remove(id: Types.ObjectId): Promise<Keystore> {
		return KeystoreModel.findByIdAndRemove(id).lean<Keystore>().exec();
	}

	public static find(client: User, primaryKey: string, secondaryKey: string): Promise<Keystore> {
		return KeystoreModel
			.findOne({ client: client, primaryKey: primaryKey, secondaryKey: secondaryKey })
			.lean<Keystore>()
			.exec();
	}

	public static async create(client: User, primaryKey: string, secondaryKey: string)
		: Promise<Keystore> {
		const now = new Date();
		const keystore = await KeystoreModel.create(<Keystore>{
			client: client,
			primaryKey: primaryKey,
			secondaryKey: secondaryKey,
			createdAt: now,
			updatedAt: now
		});
		return keystore.toObject();
	}
}