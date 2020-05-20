import ApiKey, { ApiKeyModel } from './ApiKeyModel';

export default class ApiKeyRepo {
  public static async findByKey(key: string): Promise<ApiKey> {
    return ApiKeyModel.findOne({ key, status: true }).lean<ApiKey>().exec();
  }
}
