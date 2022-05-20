/**
 * 健康診断サービス
 */
import * as factory from '@chevre/factory';
import * as GMO from '@motionpicture/gmo-service';
import * as createDebug from 'debug';

import { MongoRepository as GMONotificationRepo } from '../repo/gmoNotification';

export type GMONotificationOperation<T> = (gmoNotificationRepository: GMONotificationRepo) => Promise<T>;
export type IGMOResultNotification = GMO.factory.resultNotification.creditCard.IResultNotification;

const debug = createDebug('sskts-domain:service:report:health');

/**
 * GMO売上健康診断レポートインターフェース
 */
export interface IReportOfGMOSalesHealthCheck {
    madeFrom: Date;
    madeThrough: Date;
    numberOfSales: number;
    totalAmount: number;
    totalAmountCurrency: factory.priceCurrency;
    unhealthGMOSales: IUnhealthGMOSale[];
}

/**
 * 不健康なGMO売上インターフェース
 */
export interface IUnhealthGMOSale {
    orderId: string;
    amount: number;
    reason: string;
}

/**
 * 期間指定でGMO実売上の健康診断を実施する
 * いったん保留(2022-05-20)
 */
export function checkGMONotifications(madeFrom: Date, madeThrough: Date) {
    return async (repos: {
        gmoNotification: GMONotificationRepo;
    }): Promise<IReportOfGMOSalesHealthCheck> => {
        const sales = await repos.gmoNotification.searchSales({
            tranDateFrom: madeFrom,
            tranDateThrough: madeThrough
        });
        debug(sales.length, 'sales found.');

        const totalAmount = sales.reduce((a, b) => a + b.amount, 0);

        const errors: IUnhealthGMOSale[] = [];
        sales.forEach((gmoSale) => {
            try {
                // オーダーIDに該当する取引がなければエラー

                // アクセスIDが一致するかどうか

                // 金額が同一かどうか
            } catch (error) {
                errors.push({
                    orderId: gmoSale.orderId,
                    amount: gmoSale.amount,
                    reason: error.message
                });
            }
        });

        return {
            madeFrom: madeFrom,
            madeThrough: madeThrough,
            numberOfSales: sales.length,
            totalAmount: totalAmount,
            totalAmountCurrency: factory.priceCurrency.JPY,
            unhealthGMOSales: errors
        };
    };
}
