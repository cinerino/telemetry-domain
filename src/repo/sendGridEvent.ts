import { Connection, Model } from 'mongoose';

import { modelName, schema } from './mongoose/schemas/sendGridEvent';

/**
 * SendGridイベントリポジトリ
 */
export class MongoRepository {
    public readonly sendGridEventModel: typeof Model;

    constructor(connection: Connection) {
        this.sendGridEventModel = connection.model(modelName, schema);
    }
}
