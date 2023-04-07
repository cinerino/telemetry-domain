import { Connection, Model } from 'mongoose';

import { modelName, schema } from './mongoose/schemas/transaction';

/**
 * 取引リポジトリ
 */
export class MongoRepository {
    public readonly transactionModel: typeof Model;

    constructor(connection: Connection) {
        this.transactionModel = connection.model(modelName, schema);
    }
}
