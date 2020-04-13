import Role, { RoleModel } from './RoleModel';

export default class RoleRepository {

	public static findByCode(code: string): Promise<Role> {
		return RoleModel.findOne({ code: code, status: true }).lean<Role>().exec();
	}
}