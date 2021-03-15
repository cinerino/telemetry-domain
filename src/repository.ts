// tslint:disable:max-classes-per-file completed-docs
/**
 * repository
 */
import { MongoRepository as ActionRepo } from './repo/action';
import { MongoRepository as GMONotificationRepo } from './repo/gmoNotification';
import { MongoRepository as SendGridEventRepo } from './repo/sendGridEvent';
import { MongoRepository as TaskRepo } from './repo/task';
import { MongoRepository as TelemetryRepo } from './repo/telemetry';
import { MongoRepository as TransactionRepo } from './repo/transaction';

export class Action extends ActionRepo { }
export class GMONotification extends GMONotificationRepo { }
export class SendGridEvent extends SendGridEventRepo { }
export class Task extends TaskRepo { }
export class Telemetry extends TelemetryRepo { }
export class Transaction extends TransactionRepo { }
