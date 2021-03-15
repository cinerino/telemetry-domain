import * as mongoose from 'mongoose';

const modelName = 'Transaction';

const writeConcern: mongoose.WriteConcern = { j: true, w: 'majority', wtimeout: 10000 };

/**
 * 取引スキーマ
 */
const schema = new mongoose.Schema(
    {
        status: String,
        typeOf: String,
        expires: Date,
        startDate: Date,
        endDate: Date,
        tasksExportedAt: Date,
        tasksExportationStatus: String
    },
    {
        collection: 'transactions',
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

mongoose.model(modelName, schema)
    .on(
        'index',
        // tslint:disable-next-line:no-single-line-block-comment
        /* istanbul ignore next */
        (error) => {
            if (error !== undefined) {
                // tslint:disable-next-line:no-console
                console.error(error);
            }
        }
    );

export { modelName, schema };
