import { Connection, Model } from 'mongoose';

import { modelName } from './mongoose/model/transaction';

/**
 * 取引リポジトリ
 */
export class MongoRepository {
    public readonly transactionModel: typeof Model;

    constructor(connection: Connection) {
        this.transactionModel = connection.model(modelName);
    }
}
