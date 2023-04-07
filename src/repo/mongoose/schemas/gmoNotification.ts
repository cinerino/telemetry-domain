import * as mongoose from 'mongoose';

import { writeConcern } from '../writeConcern';

const modelName = 'GMONotification';

/**
 * GMO通知スキーマ
 */
const schema = new mongoose.Schema(
    {
        shopId: String, // ショップID
        shopPass: String, // ショップパスワード
        accessId: String, // 取引ID
        accessPass: String, // 取引パスワード
        orderId: String, // オーダーID
        status: String, // 現状態
        jobCd: String, // 処理区分
        amount: Number, // 利用金額
        tax: Number, // 税送料
        currency: String, // 通貨コード
        forward: String, // 仕向先会社コード
        method: String, // 支払方法
        payTimes: String, // 支払回数
        tranId: String, // トランザクションID
        approve: String, // 承認番号
        tranDate: String, // 処理日付
        errCode: String, // エラーコード
        errInfo: String, // エラー詳細コード
        payType: String // 決済方法
    },
    {
        collection: 'gmoNotifications',
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

// GMO売上健康診断時に使用
schema.index({ jobCd: 1, tranDate: 1 });

export { modelName, schema };
