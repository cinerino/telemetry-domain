import * as mongoose from 'mongoose';

const safe = { j: true, w: 'majority', wtimeout: 10000 };

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
        safe: safe,
        strict: true,
        useNestedStrict: true,
        timestamps: {
            createdAt: 'createdAt',
            updatedAt: 'updatedAt'
        },
        toJSON: {
            getters: true,
            virtuals: true,
            minimize: false,
            versionKey: false
        },
        toObject: {
            getters: true,
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

export default mongoose.model('Telemetry', schema)
    .on(
        'index',
        // tslint:disable-next-line:no-single-line-block-comment
        /* istanbul ignore next */
        (error) => {
            if (error !== undefined) {
                console.error(error);
            }
        }
    );
