import { Connection, Model } from 'mongoose';

import { modelName, schema } from './mongoose/schemas/notification';

/**
 * 通知リポジトリ
 */
export class MongoRepository {
    public readonly notificationModel: typeof Model;
    constructor(connection: Connection) {
        this.notificationModel = connection.model(modelName, schema);
    }
}
