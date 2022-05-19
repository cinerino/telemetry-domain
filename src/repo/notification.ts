import { Connection } from 'mongoose';

import NotificationModel from './mongoose/model/notification';

/**
 * 通知リポジトリ
 */
export class MongoRepository {
    public readonly notificationModel: typeof NotificationModel;
    constructor(connection: Connection) {
        this.notificationModel = connection.model(NotificationModel.modelName);
    }
}
