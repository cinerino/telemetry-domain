import { IConnectionSettings, IOperation } from '../task';

import * as factory from '../../factory';
import { MongoRepository as GMONotificationRepo } from '../../repo/gmoNotification';

import * as HealthService from '../health';

/**
 * タスク実行関数
 */
export function call(data: factory.task.IData<any>): IOperation<void> {
    return async (settings: IConnectionSettings) => {
        const gmoNotificationRepo = new GMONotificationRepo(settings.connection);
        await HealthService.checkGMONotification(data)({
            gmoNotification: gmoNotificationRepo
        });
    };
}
