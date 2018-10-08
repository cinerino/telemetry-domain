// tslint:disable:max-classes-per-file completed-docs
/**
 * service module
 */
import * as HealthService from './service/health';
import * as TaskService from './service/task';
import * as TelemetryService from './service/telemetry';

export import health = HealthService;
export import task = TaskService;
export import telemetry = TelemetryService;
