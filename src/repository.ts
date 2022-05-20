// tslint:disable:max-classes-per-file completed-docs
/**
 * repository
 */
import { MongoRepository as GMONotificationRepo } from './repo/gmoNotification';
import { MongoRepository as NotificationRepo } from './repo/notification';
import { MongoRepository as SendGridEventRepo } from './repo/sendGridEvent';
import { MongoRepository as TaskRepo } from './repo/task';
import { MongoRepository as TelemetryRepo } from './repo/telemetry';
import { MongoRepository as TransactionRepo } from './repo/transaction';

export class GMONotification extends GMONotificationRepo { }
export class Notification extends NotificationRepo { }
export class SendGridEvent extends SendGridEventRepo { }
export class Task extends TaskRepo { }
export class Telemetry extends TelemetryRepo { }
export class Transaction extends TransactionRepo { }
