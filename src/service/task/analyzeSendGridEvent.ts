import { IConnectionSettings, IOperation } from '../task';

import * as factory from '../../factory';

/**
 * タスク実行関数
 */
export function call(_: factory.task.IData<any>): IOperation<void> {
    return async (__: IConnectionSettings) => {
        // とりあえず分析内容保留
    };
}
