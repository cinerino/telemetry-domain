import { IConnectionSettings, IOperation } from '../task';

import * as factory from '../../factory';
import { MongoRepository as TelemetryRepo } from '../../repo/telemetry';

import * as TelemetryService from '../telemetry';

/**
 * タスク実行関数
 */
export function call(data: factory.task.IData<any>): IOperation<void> {
    return async (settings: IConnectionSettings) => {
        const telemetryRepo = new TelemetryRepo(settings.connection);
        // `互換性維持のため
        if (data.project === undefined) {
            data.project = { id: data.projectId };
        }
        await TelemetryService.analyzePlaceOrder(data)({
            telemetry: telemetryRepo
        });
    };
}
