/**
 * データ測定サービス
 * 実験的実装中
 */
import * as createDebug from 'debug';
import * as moment from 'moment';

import * as factory from '../factory';

// import { MongoRepository as ActionRepo } from '../../repo/action';
import { MongoRepository as TaskRepo } from '../repo/task';
import { MongoRepository as TelemetryRepo } from '../repo/telemetry';

export type TelemetryOperation<T> =
    (repos: { telemetry: TelemetryRepo }) => Promise<T>;
export type TaskOperation<T> =
    (repos: { task: TaskRepo }) => Promise<T>;
const debug = createDebug('cinerino-telemetry-domain:service');
export enum TelemetryType {
    /**
     * 売上高
     */
    SalesAmount = 'SalesAmount',
    /**
     * クライアントごとの売上高
     */
    SalesAmountByClient = 'SalesAmountByClient',
    /**
     * 決済方法ごとの売上高
     */
    SalesAmountByPaymentMethod = 'SalesAmountByPaymentMethod',
    /**
     * 販売者ごとの売上高
     */
    SalesAmountBySeller = 'SalesAmountBySeller',
    /**
     * 注文アイテム数
     */
    NumOrderItems = 'NumOrderItems',
    /**
     * クライアントごとの注文アイテム数
     */
    NumOrderItemsByClient = 'NumOrderItemsByClient',
    /**
     * 決済方法ごとの注文アイテム数
     */
    NumOrderItemsByPaymentMethod = 'NumOrderItemsByPaymentMethod',
    /**
     * 販売者ごとの注文アイテム数
     */
    NumOrderItemsBySeller = 'NumOrderItemsBySeller',
    /**
     * 取引ステータスごとの注文取引数
     */
    NumPlaceOrderByStatus = 'NumPlaceOrderByStatus',
    /**
     * 取引タイプごとの開始取引数
     */
    NumStartedTransactionsByType = 'NumStartedTransactionsByType'
}
export enum TelemetryScope {
    Global = 'Global'
}
/**
 * 測定データインターフェース
 */
export interface ITelemetry {
    object: any;
    result: any;
    startDate: Date;
    endDate: Date;
    purpose: {
        typeOf: TelemetryType;
    };
}
/**
 * 注文取引データを分析する
 */
// tslint:disable-next-line:no-single-line-block-comment
/* istanbul ignore next */
export function analyzePlaceOrder(params: {
    project: { id: string };
    transaction: factory.transaction.ITransaction<factory.transactionType.PlaceOrder>;
}) {
    // tslint:disable-next-line:max-func-body-length
    return async (repos: {
        telemetry: TelemetryRepo;
    }) => {
        const endDate = params.transaction.endDate;
        if (endDate === undefined) {
            throw new factory.errors.Argument('transaction', 'Not ended yet');
        }

        const endedTransactions = [params.transaction];
        debug(endedTransactions.length, 'endedTransactions found');
        const confirmedTransactions = endedTransactions.filter((t) => t.status === factory.transactionStatusType.Confirmed);

        // 金額集計
        const totalSalesAmount = confirmedTransactions.map((t) => (<factory.transaction.placeOrder.IResult>t.result).order.price)
            .reduce((a, b) => a + b, 0);
        // 注文アイテム数
        const numOrderItems = confirmedTransactions
            .map((t) => (<factory.transaction.placeOrder.IResult>t.result).order.acceptedOffers.length)
            .reduce((a, b) => a + b, 0);

        const salesAmountByClient: ITelemetryValueAsObject = {};
        const salesAmountByPaymentMethod: ITelemetryValueAsObject = {};
        const salesAmountBySeller: ITelemetryValueAsObject = {};
        const numOrderItemsByClient: ITelemetryValueAsObject = {};
        const numOrderItemsByPaymentMethod: ITelemetryValueAsObject = {};
        const numOrderItemsBySeller: ITelemetryValueAsObject = {};
        const numPlaceOrderByStatus: ITelemetryValueAsObject = {
            [params.transaction.status]: 1
        };
        const numStartedTransactionsByType: ITelemetryValueAsObject = {
            [params.transaction.typeOf]: 1
        };

        confirmedTransactions.forEach((t) => {
            const order = (<factory.transaction.placeOrder.IResult>t.result).order;
            const amount = order.price;
            const numItems = order.acceptedOffers.length;

            // クライアントごとの集計
            const clientUser = t.object.clientUser;
            if (clientUser !== undefined) {
                const clientId = clientUser.client_id;
                if (salesAmountByClient[clientId] === undefined) {
                    salesAmountByClient[clientId] = 0;
                }
                salesAmountByClient[clientId] += amount;

                if (numOrderItemsByClient[clientId] === undefined) {
                    numOrderItemsByClient[clientId] = 0;
                }
                numOrderItemsByClient[clientId] += numItems;
            }

            // 決済方法ごとの集計
            order.paymentMethods.forEach((paymentMethod) => {
                const paymentMethodType = paymentMethod.typeOf;
                if (salesAmountByPaymentMethod[paymentMethodType] === undefined) {
                    salesAmountByPaymentMethod[paymentMethodType] = 0;
                }
                salesAmountByPaymentMethod[paymentMethodType] += amount;

                if (numOrderItemsByPaymentMethod[paymentMethodType] === undefined) {
                    numOrderItemsByPaymentMethod[paymentMethodType] = 0;
                }
                numOrderItemsByPaymentMethod[paymentMethodType] += numItems;
            });

            // 販売者ごとの集計
            const seller = t.seller;
            if (seller.id !== undefined) {
                const sellerId = seller.id;
                if (salesAmountBySeller[sellerId] === undefined) {
                    salesAmountBySeller[sellerId] = 0;
                }
                salesAmountBySeller[sellerId] += amount;

                if (numOrderItemsBySeller[sellerId] === undefined) {
                    numOrderItemsBySeller[sellerId] = 0;
                }
                numOrderItemsBySeller[sellerId] += numItems;
            }
        });
        debug('salesAmountByClient:', salesAmountByClient);
        debug('salesAmountByPaymentMethod:', salesAmountByPaymentMethod);
        debug('salesAmountBySeller:', salesAmountBySeller);
        debug('numOrderItemsByClient:', numOrderItemsByClient);
        debug('numOrderItemsByPaymentMethod:', numOrderItemsByPaymentMethod);
        debug('numOrderItemsBySeller:', numOrderItemsBySeller);
        debug('numPlaceOrderByStatus:', numPlaceOrderByStatus);
        debug('numStartedTransactionsByType:', numStartedTransactionsByType);

        const startMeasureDate = moment(moment(params.transaction.startDate).format('YYYY-MM-DDTHH:mm:00Z')).toDate();
        const endMeasureDate = moment(moment(endDate).format('YYYY-MM-DDTHH:mm:00Z')).toDate();
        const savingTelemetries: {
            typeOf: TelemetryType;
            value: ITelemetryValue;
            measureDate: Date;
        }[] = [
                { typeOf: TelemetryType.NumPlaceOrderByStatus, value: numPlaceOrderByStatus, measureDate: endMeasureDate },
                { typeOf: TelemetryType.NumStartedTransactionsByType, value: numStartedTransactionsByType, measureDate: startMeasureDate }
            ];
        switch (params.transaction.status) {
            case factory.transactionStatusType.Canceled:
                break;
            case factory.transactionStatusType.Confirmed:
                savingTelemetries.push(
                    { typeOf: TelemetryType.SalesAmount, value: totalSalesAmount, measureDate: endMeasureDate },
                    { typeOf: TelemetryType.SalesAmountByClient, value: salesAmountByClient, measureDate: endMeasureDate },
                    { typeOf: TelemetryType.SalesAmountByPaymentMethod, value: salesAmountByPaymentMethod, measureDate: endMeasureDate },
                    { typeOf: TelemetryType.SalesAmountBySeller, value: salesAmountBySeller, measureDate: endMeasureDate },
                    { typeOf: TelemetryType.NumOrderItems, value: numOrderItems, measureDate: endMeasureDate },
                    { typeOf: TelemetryType.NumOrderItemsByClient, value: numOrderItemsByClient, measureDate: endMeasureDate },
                    // tslint:disable-next-line:max-line-length
                    { typeOf: TelemetryType.NumOrderItemsByPaymentMethod, value: numOrderItemsByPaymentMethod, measureDate: endMeasureDate },
                    { typeOf: TelemetryType.NumOrderItemsBySeller, value: numOrderItemsBySeller, measureDate: endMeasureDate }
                );
                break;
            case factory.transactionStatusType.Expired:
                break;
            default:
        }
        debug('saving telemetry...', savingTelemetries);
        await Promise.all(savingTelemetries.map(async (telemetry) => {
            await addTelemetry({
                project: params.project,
                telemetryType: telemetry.typeOf,
                measureDate: telemetry.measureDate,
                value: telemetry.value
            })(repos);
        }));
    };
}
export interface ITelemetryValueAsObject { [key: string]: number; }
export type ITelemetryValue = number | ITelemetryValueAsObject;
function addTelemetry(params: {
    project: { id: string };
    telemetryType: TelemetryType;
    measureDate: Date;
    value: ITelemetryValue;
}) {
    return async (repos: { telemetry: TelemetryRepo }) => {
        const telemetryMeasureDate = moment(moment(params.measureDate).format('YYYY-MM-DDT00:00:00Z')).toDate();
        const initialValue = (typeof params.value === 'number') ? 0 : {};
        const setOnInsert: any = {
            'result.numSamples': 0,
            'result.totalSamples': initialValue
        };
        // tslint:disable-next-line:no-magic-numbers
        for (let i = 0; i < 24; i += 1) {
            setOnInsert[`result.values.${i}.numSamples`] = 0;
            setOnInsert[`result.values.${i}.totalSamples`] = initialValue;
            // tslint:disable-next-line:no-magic-numbers
            for (let j = 0; j < 60; j += 1) {
                setOnInsert[`result.values.${i}.values.${j}`] = initialValue;
            }
        }

        const hour = moment(params.measureDate).format('H');
        const min = moment(params.measureDate).format('m');
        const inc = {
            [`result.values.${hour}.numSamples`]: 1,
            'result.numSamples': 1
        };
        if (typeof params.value === 'number') {
            inc[`result.values.${hour}.values.${min}`] = params.value;
            inc[`result.values.${hour}.totalSamples`] = params.value;
            inc['result.totalSamples'] = params.value;
        } else {
            const valueAsObject = params.value;
            Object.keys(valueAsObject).forEach((key) => {
                inc[`result.values.${hour}.values.${min}.${key}`] = valueAsObject[key];
                inc[`result.values.${hour}.totalSamples.${key}`] = valueAsObject[key];
                inc[`result.totalSamples.${key}`] = valueAsObject[key];
            });
        }

        const condition: any = {
            'purpose.typeOf': { $exists: true, $eq: params.telemetryType },
            'object.projectId': { $exists: true, $eq: params.project.id },
            'object.scope': { $exists: true, $eq: TelemetryScope.Global },
            'object.measureDate': { $exists: true, $eq: telemetryMeasureDate }
        };
        // 日データなければ初期化
        await repos.telemetry.telemetryModel.findOneAndUpdate(
            condition,
            { $setOnInsert: setOnInsert },
            { upsert: true, strict: false }
        ).exec();
        // increment
        await repos.telemetry.telemetryModel.findOneAndUpdate(
            condition,
            { $inc: inc },
            { new: true }
        ).exec();
        debug('telemetry saved', params.telemetryType, params.measureDate);
    };
}
export function search(params: {
    projectId: string;
    telemetryType: string;
    measureFrom: Date;
    measureThrough: Date;
    scope: TelemetryScope;
}) {
    return async (repos: {
        telemetry: TelemetryRepo;
    }) => {
        const measureFrom = moment(params.measureFrom);
        const measureThrough = moment(params.measureThrough);
        let resolution = '1day';
        if (measureThrough.diff(measureFrom, 'days') < 1) {
            resolution = '1min';
        } else if (measureThrough.diff(measureFrom, 'months') < 1) {
            resolution = '1hour';
        }

        const searchConditions = {
            measureFrom: moment(moment(measureFrom).format('YYYY-MM-DDT00:00:00Z')).toDate(),
            measureThrough: moment(moment(measureThrough).add(1, 'day').format('YYYY-MM-DDT00:00:00Z')).toDate()
        };
        const telemetries = await repos.telemetry.telemetryModel.find({
            $and: [
                { 'purpose.typeOf': { $exists: true, $eq: params.telemetryType } },
                { 'object.projectId': { $exists: true, $eq: params.projectId } },
                { 'object.scope': { $exists: true, $eq: params.scope } },
                { 'object.measureDate': { $exists: true, $gte: searchConditions.measureFrom } },
                { 'object.measureDate': { $exists: true, $lt: searchConditions.measureThrough } }
            ]
        }).sort({ 'object.measureDate': 1 }).exec().then((docs) => docs.map((doc) => doc.toObject()));
        const datas: any[] = [];
        switch (resolution) {
            case '1hour':
                telemetries.forEach((telemetry) => {
                    Object.keys(telemetry.result.values).forEach((h) => {
                        datas.push({
                            measureDate: moment(telemetry.object.measureDate).add(Number(h), 'hours').toDate(),
                            value: telemetry.result.values[h].totalSamples
                        });
                    });
                });
                break;
            case '1min':
                telemetries.forEach((telemetry) => {
                    Object.keys(telemetry.result.values).forEach((h) => {
                        Object.keys(telemetry.result.values[h].values).forEach((m) => {
                            datas.push({
                                measureDate: moment(telemetry.object.measureDate)
                                    .add(Number(h), 'hours').add(Number(m), 'minutes').toDate(),
                                value: telemetry.result.values[h].values[m]
                            });
                        });
                    });
                });
                break;
            default:
                telemetries.forEach((telemetry) => {
                    datas.push({
                        measureDate: telemetry.object.measureDate,
                        value: telemetry.result.totalSamples
                    });
                });
        }

        return datas;
    };
}
