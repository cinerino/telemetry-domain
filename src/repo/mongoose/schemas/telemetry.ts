import * as mongoose from 'mongoose';

import { writeConcern } from '../writeConcern';

const modelName = 'Telemetry';

/**
 * 測定スキーマ
 */
const schema = new mongoose.Schema(
    {
        result: mongoose.SchemaTypes.Mixed,
        error: mongoose.SchemaTypes.Mixed,
        object: mongoose.SchemaTypes.Mixed,
        startDate: Date,
        endDate: Date,
        purpose: mongoose.SchemaTypes.Mixed
    },
    {
        collection: 'telemetries',
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
    { 'purpose.typeOf': 1 },
    {
        name: 'searchByPurposeTypeOf',
        partialFilterExpression: {
            'purpose.typeOf': { $exists: true }
        }
    }
);
schema.index(
    { 'object.scope': 1 },
    {
        name: 'searchByObjectScope',
        partialFilterExpression: {
            'object.scope': { $exists: true }
        }
    }
);
schema.index(
    { 'object.measureDate': 1 },
    {
        name: 'searchByObjectMeasureDate',
        partialFilterExpression: {
            'object.measureDate': { $exists: true }
        }
    }
);
schema.index(
    { 'object.projectId': 1 },
    {
        name: 'searchByObjectProjectId',
        partialFilterExpression: {
            'object.projectId': { $exists: true }
        }
    }
);
schema.index(
    { 'purpose.typeOf': 1, 'object.scope': 1, 'object.measureDate': 1 },
    {
        name: 'searchByMeasureDate',
        partialFilterExpression: {
            'purpose.typeOf': { $exists: true },
            'object.scope': { $exists: true },
            'object.measureDate': { $exists: true }
        }
    }
);

export { modelName, schema };
