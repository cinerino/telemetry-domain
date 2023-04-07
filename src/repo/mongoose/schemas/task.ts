import * as mongoose from 'mongoose';

import { writeConcern } from '../writeConcern';

const modelName = 'Task';

const executionResultSchema = new mongoose.Schema(
    {},
    {
        id: false,
        _id: false,
        strict: false
    }
);
const dataSchema = new mongoose.Schema(
    {},
    {
        id: false,
        _id: false,
        strict: false
    }
);

/**
 * タスクスキーマ
 */
const schema = new mongoose.Schema(
    {
        name: String,
        status: String,
        runsAt: Date,
        remainingNumberOfTries: Number,
        lastTriedAt: Date,
        numberOfTried: Number,
        executionResults: [executionResultSchema],
        data: dataSchema
    },
    {
        collection: 'tasks',
        id: true,
        read: 'primaryPreferred',
        writeConcern: writeConcern,
        strict: true,
        useNestedStrict: true,
        timestamps: {
            createdAt: 'createdAt',
            updatedAt: 'updatedAt'
        },
        toJSON: {
            getters: false,
            virtuals: false,
            minimize: false,
            versionKey: false
        },
        toObject: {
            getters: false,
            virtuals: true,
            minimize: false,
            versionKey: false
        }
    }
);

schema.index(
    { createdAt: 1 },
    { name: 'searchByCreatedAt' }
);
schema.index(
    { updatedAt: 1 },
    { name: 'searchByUpdatedAt' }
);
schema.index(
    { name: 1 },
    { name: 'searchByName' }
);
schema.index(
    { status: 1 },
    { name: 'searchByStatus' }
);
schema.index(
    { runsAt: 1 },
    { name: 'searchByRunsAt' }
);
schema.index(
    { lastTriedAt: 1 },
    {
        name: 'searchByLastTriedAt',
        partialFilterExpression: {
            lastTriedAt: { $type: 'date' }
        }
    }
);

// 取引のタスク検索に使用
schema.index(
    { 'data.transactionId': 1 },
    {
        partialFilterExpression: {
            'data.transactionId': { $exists: true }
        }
    }
);
// 基本的にグループごとに、ステータスと実行日時を見て、タスクは実行される
schema.index(
    { name: 1, status: 1, numberOfTried: 1, runsAt: 1 }
);
// ステータス&最終トライ日時&残りトライ可能回数を見て、リトライor中止を決定する
schema.index(
    { remainingNumberOfTries: 1, status: 1, lastTriedAt: 1 },
    {
        partialFilterExpression: {
            lastTriedAt: { $type: 'date' }
        }
    }
);
// 測定データ作成時に使用
schema.index({ status: 1, runsAt: 1 });
schema.index({ name: 1, createdAt: 1 });
schema.index(
    { status: 1, name: 1, lastTriedAt: 1 },
    {
        partialFilterExpression: {
            lastTriedAt: { $type: 'date' }
        }
    }
);

export { modelName, schema };
