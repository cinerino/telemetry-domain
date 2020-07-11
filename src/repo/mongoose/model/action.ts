import * as mongoose from 'mongoose';

const safe = { j: true, w: 'majority', wtimeout: 10000 };

/**
 * アクションスキーマ
 */
const schema = new mongoose.Schema(
    {
        actionStatus: String,
        typeOf: String,
        agent: mongoose.SchemaTypes.Mixed,
        recipient: mongoose.SchemaTypes.Mixed,
        result: mongoose.SchemaTypes.Mixed,
        error: mongoose.SchemaTypes.Mixed,
        object: mongoose.SchemaTypes.Mixed,
        startDate: Date,
        endDate: Date,
        purpose: mongoose.SchemaTypes.Mixed,
        potentialActions: mongoose.SchemaTypes.Mixed,
        amount: mongoose.SchemaTypes.Mixed,
        fromLocation: mongoose.SchemaTypes.Mixed,
        toLocation: mongoose.SchemaTypes.Mixed
    },
    {
        collection: 'actions',
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
    { typeOf: 1, _id: 1 }
);
schema.index(
    { typeOf: 1, 'purpose.id': 1 },
    {
        partialFilterExpression: {
            'purpose.id': { $exists: true }
        }
    }
);
schema.index(
    { 'object.typeOf': 1, 'purpose.id': 1, typeOf: 1, _id: 1 },
    {
        partialFilterExpression: {
            'object.typeOf': { $exists: true },
            'purpose.id': { $exists: true }
        }
    }
);
schema.index(
    { typeOf: 1, 'object.typeOf': 1, startDate: 1 }
);

export default mongoose.model('Action', schema)
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
