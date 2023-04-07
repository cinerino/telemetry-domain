import * as moment from 'moment';
import { Connection, Model } from 'mongoose';

import * as factory from '../factory';
import { modelName, schema } from './mongoose/schemas/task';

/**
 * タスク実行時のソート条件
 */
const sortOrder4executionOfTasks = {
    numberOfTried: factory.sortType.Ascending, // トライ回数の少なさ優先
    runsAt: factory.sortType.Ascending // 実行予定日時の早さ優先
};
/**
 * タスクリポジトリ
 */
export class MongoRepository {
    public readonly taskModel: typeof Model;
    constructor(connection: Connection) {
        this.taskModel = connection.model(modelName, schema);
    }
    public static CREATE_MONGO_CONDITIONS(params: factory.task.ISearchConditions) {
        const andConditions: any[] = [{
            name: { $exists: true }
        }];
        // tslint:disable-next-line:no-single-line-block-comment
        /* istanbul ignore else */
        if (params.name !== undefined) {
            andConditions.push({
                name: params.name
            });
        }
        // tslint:disable-next-line:no-single-line-block-comment
        /* istanbul ignore else */
        if (Array.isArray(params.statuses)) {
            andConditions.push({
                status: { $in: params.statuses }
            });
        }
        // tslint:disable-next-line:no-single-line-block-comment
        /* istanbul ignore else */
        if (params.runsFrom !== undefined) {
            andConditions.push({
                runsAt: { $gte: params.runsFrom }
            });
        }
        // tslint:disable-next-line:no-single-line-block-comment
        /* istanbul ignore else */
        if (params.runsThrough !== undefined) {
            andConditions.push({
                runsAt: { $lte: params.runsThrough }
            });
        }
        // tslint:disable-next-line:no-single-line-block-comment
        /* istanbul ignore else */
        if (params.lastTriedFrom !== undefined) {
            andConditions.push({
                lastTriedAt: {
                    $type: 'date',
                    $gte: params.lastTriedFrom
                }
            });
        }
        // tslint:disable-next-line:no-single-line-block-comment
        /* istanbul ignore else */
        if (params.lastTriedThrough !== undefined) {
            andConditions.push({
                lastTriedAt: {
                    $type: 'date',
                    $lte: params.lastTriedThrough
                }
            });
        }

        return andConditions;
    }
    public async save<T extends factory.taskName>(taskAttributes: factory.task.IAttributes<T>): Promise<factory.task.ITask<T>> {
        return this.taskModel.create<factory.task.IAttributes<any>>(taskAttributes)
            .then(
                (doc) => doc.toObject()
            );
    }
    public async executeOneByName<T extends factory.taskName>(taskName: T): Promise<factory.task.ITask<T> | null> {
        const doc = await this.taskModel.findOneAndUpdate(
            {
                status: factory.taskStatus.Ready,
                runsAt: { $lt: new Date() },
                name: taskName
            },
            {
                status: factory.taskStatus.Running, // 実行中に変更
                lastTriedAt: new Date(),
                $inc: {
                    remainingNumberOfTries: -1, // 残りトライ可能回数減らす
                    numberOfTried: 1 // トライ回数増やす
                }
            },
            { new: true }
        )
            .sort(sortOrder4executionOfTasks)
            .exec();
        if (doc === null) {
            // tslint:disable-next-line:no-null-keyword
            return null;
        }

        return doc.toObject();
    }
    public async retry(intervalInMinutes: number) {
        const lastTriedAtShoudBeLessThan = moment()
            .add(-intervalInMinutes, 'minutes')
            .toDate();
        await this.taskModel.update(
            {
                status: factory.taskStatus.Running,
                lastTriedAt: {
                    $type: 'date',
                    $lt: lastTriedAtShoudBeLessThan
                },
                remainingNumberOfTries: { $gt: 0 }
            },
            {
                status: factory.taskStatus.Ready // 実行前に変更
            },
            { multi: true }
        )
            .exec();
    }
    public async abortOne(intervalInMinutes: number): Promise<factory.task.ITask<factory.taskName> | null> {
        const lastTriedAtShoudBeLessThan = moment()
            .add(-intervalInMinutes, 'minutes')
            .toDate();
        const doc = await this.taskModel.findOneAndUpdate(
            {
                status: factory.taskStatus.Running,
                lastTriedAt: {
                    $type: 'date',
                    $lt: lastTriedAtShoudBeLessThan
                },
                remainingNumberOfTries: 0
            },
            {
                status: factory.taskStatus.Aborted
            },
            { new: true }
        )
            .exec();
        if (doc === null) {
            // tslint:disable-next-line:no-null-keyword
            return null;
        }

        return doc.toObject();
    }
    public async pushExecutionResultById(
        id: string,
        status: factory.taskStatus,
        executionResult: factory.task.IExecutionResult
    ): Promise<void> {
        await this.taskModel.findByIdAndUpdate(
            id,
            {
                status: status, // 失敗してもここでは戻さない(Runningのまま待機)
                $push: { executionResults: executionResult }
            }
        )
            .exec();
    }
    /**
     * タスクを取得する
     */
    public async findById<T extends factory.taskName>(params: {
        name: T;
        id: string;
    }): Promise<factory.task.ITask<T>> {
        const doc = await this.taskModel.findOne(
            {
                name: params.name,
                _id: params.id
            },
            {
                __v: 0,
                createdAt: 0,
                updatedAt: 0
            }
        )
            .exec();
        if (doc === null) {
            throw new factory.errors.NotFound('Task');
        }

        return doc.toObject();
    }
    // public async count(params: factory.task.ISearchConditions): Promise<number> {
    //     const conditions = MongoRepository.CREATE_MONGO_CONDITIONS(params);

    //     return this.taskModel.countDocuments({ $and: conditions })
    //         .setOptions({ maxTimeMS: 10000 })
    //         .exec();
    // }
    /**
     * 検索する
     */
    public async search<T extends factory.taskName>(
        params: factory.task.ISearchConditions
    ): Promise<factory.task.ITask<T>[]> {
        const conditions = MongoRepository.CREATE_MONGO_CONDITIONS(params);
        const query = this.taskModel.find(
            { $and: conditions },
            {
                __v: 0,
                createdAt: 0,
                updatedAt: 0
            }
        );
        // tslint:disable-next-line:no-single-line-block-comment
        /* istanbul ignore else */
        if (params.limit !== undefined && params.page !== undefined) {
            query.limit(params.limit)
                .skip(params.limit * (params.page - 1));
        }
        // tslint:disable-next-line:no-single-line-block-comment
        /* istanbul ignore else */
        if (typeof params.sort?.runsAt === 'number') {
            query.sort({ runsAt: params.sort.runsAt });
        }

        return query.setOptions({ maxTimeMS: 10000 })
            .exec()
            .then((docs) => docs.map((doc) => doc.toObject()));
    }
}
