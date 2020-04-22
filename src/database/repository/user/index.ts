import User, { UserModel } from './UserModel';
import Role, { RoleModel } from '@repository/role/RoleModel';
import { InternalError } from '@core/ApiError';
import { Types } from 'mongoose';
import keystoreRepository from '@repository/keystore';
import Keystore from '@repository/keystore/KeystoreModel';

export default class UserRepository {

	// contains critical information of the user
	public static findById(id: Types.ObjectId): Promise<User> {
		return UserModel.findOne({ _id: id, status: true })
			.select('+email +password +roles')
			.populate({
				path: 'roles',
				match: { status: true }
			})
			.lean<User>()
			.exec();
	}

	public static findByEmail(email: string): Promise<User> {
		return UserModel.findOne({ email: email, status: true })
			.select('+email +password +roles')
			.populate({
				path: 'roles',
				match: { status: true },
				select: { code: 1 }
			})
			.lean<User>()
			.exec();
	}

	public static findProfileById(id: Types.ObjectId): Promise<User> {
		return UserModel.findOne({ _id: id, status: true })
			.select('+roles')
			.populate({
				path: 'roles',
				match: { status: true },
				select: { code: 1 }
			})
			.lean<User>()
			.exec();
	}

	public static findPublicProfileById(id: Types.ObjectId): Promise<User> {
		return UserModel.findOne({ _id: id, status: true }).lean<User>().exec();
	}

	public static findPublicProfileByName(name: string): Promise<User> {
		return UserModel.findOne({ name: name, status: true }).lean<User>().exec();
	}

	public static async create(user: User, accessTokenKey: string, refreshTokenKey: string, roleCode: string)
		: Promise<{ user: User, keystore: Keystore }> {
		const now = new Date();

		const role = await RoleModel.findOne({ code: roleCode }).select('+email +password').lean<Role>().exec();
		if (!role) throw new InternalError('Role must be defined');

		user.roles = [role._id];
		user.createdAt = user.updatedAt = now;
		const createdUser = await UserModel.create(user);
		const keystore = await keystoreRepository.create(createdUser._id, accessTokenKey, refreshTokenKey);
		return { user: createdUser.toObject(), keystore };
	}

	public static async update(user: User, accessTokenKey: string, refreshTokenKey: string)
		: Promise<{ user: User, keystore: Keystore }> {
		user.updatedAt = new Date();
		await UserModel.updateOne({ _id: user._id }, { $set: { ...user }, }).lean().exec();
		const keystore = await keystoreRepository.create(user._id, accessTokenKey, refreshTokenKey);
		return { user, keystore };
	}

	public static updateInfo(user: User): Promise<any> {
		user.updatedAt = new Date();
		return UserModel.updateOne({ _id: user._id }, { $set: { ...user }, }).lean().exec();
	}

	public static removeUser(user: User): Promise<User> {
		return UserModel.findByIdAndRemove(user._id).lean<User>().exec();
	}
}