import * as mongoose from 'mongoose';

const safe = { j: true, w: 'majority', wtimeout: 10000 };

/**
 * 組織スキーマ
 */
const schema = new mongoose.Schema(
    {
        typeOf: {
            type: String,
            required: true
        },
        identifier: String,
        name: mongoose.SchemaTypes.Mixed,
        legalName: mongoose.SchemaTypes.Mixed,
        sameAs: String,
        url: String,
        parentOrganization: mongoose.SchemaTypes.Mixed,
        telephone: String,
        location: mongoose.SchemaTypes.Mixed,
        branchCode: String,
        paymentAccepted: [mongoose.SchemaTypes.Mixed]
    },
    {
        collection: 'organizations',
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

// 組織取得に使用
schema.index(
    { typeOf: 1, _id: 1 }
);

schema.index(
    {
        'location.branchCode': 1,
        typeOf: 1
    }
);

export default mongoose.model('Organization', schema)
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
