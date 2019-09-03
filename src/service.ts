/**
 * service module
 */
import * as NotificationService from './service/notification';
import * as TaskService from './service/task';
import * as TelemetryService from './service/telemetry';

export import notification = NotificationService;
export import task = TaskService;
export import telemetry = TelemetryService;
