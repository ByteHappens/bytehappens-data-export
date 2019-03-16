import { logging, runtimes } from "bytehappens";
import { loggingWinston } from "bytehappens-logging-winston";

import * as LoggerHelper from "../helpers/loggerhelper";
import * as TaskHelper from "../helpers/taskhelper";

export class RuntimeFactory<
  TLog extends logging.ILog,
  TLogger extends loggingWinston.core.WinstonLogger<TLog>,
  TRuntimeLoggerFactory extends loggingWinston.core.WinstonLoggerFactory<TLog, TLogger>,
  TStartupLoggerFactory extends loggingWinston.console.WinstonConsoleLoggerFactory<TLog>
> implements runtimes.core.IRuntimeFactory<runtimes.tasks.ITask> {
  public async CreateRuntimeAsync(): Promise<runtimes.tasks.ITask> {
    let response: runtimes.tasks.ITask;

    let startupLoggerFactory: TStartupLoggerFactory = LoggerHelper.GetStartupLoggerFactory();
    let runtimeLoggerFactory: TRuntimeLoggerFactory = await LoggerHelper.GetRuntimeLoggerFactoryAsync(startupLoggerFactory);

    let checkMongoDbAvailabilityTask: runtimes.tasks.ITask = TaskHelper.GetCheckMongoDbAvailabilityTask(startupLoggerFactory);
    let applicationTask: runtimes.tasks.ITask = TaskHelper.GetExpressApplicationTask(
      runtimeLoggerFactory,
      startupLoggerFactory
    );

    if (checkMongoDbAvailabilityTask) {
      response = new runtimes.tasks.TaskChain(
        checkMongoDbAvailabilityTask,
        applicationTask,
        applicationTask,
        "TaskChain",
        startupLoggerFactory
      );
    } else {
      response = applicationTask;
    }

    return response;
  }
}
