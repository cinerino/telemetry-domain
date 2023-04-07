import * as mongoose from 'mongoose';

import { writeConcern } from '../writeConcern';

const modelName = 'Notification';

/**
 * 汎用通知スキーマ
 */
const schema = new mongoose.Schema(
    {},
    {
        collection: 'notifications',
        id: true,
        read: 'primaryPreferred',
        writeConcern: writeConcern,
        strict: false,
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

export { modelName, schema };
