import { logging, runtimes } from "bytehappens";
import { storageMongoDb } from "bytehappens-storage-mongodb";
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

    let checkMongoDbAvailabilityTask: runtimes.tasks.ITask;
    let useMongoDb: boolean = process.env.LOGGING_MONGODB_USE === "true";
    if (useMongoDb) {
      let host: string = process.env.LOGGING_MONGODB_HOST;
      let port: number = parseInt(process.env.LOGGING_MONGODB_PORT);
      let connection: storageMongoDb.core.IMongoDbConnection = {
        host: host,
        port: port
      };

      let loggingUsername: string = process.env.LOGGING_MONGODB_USERNAME;
      let loggingPassword: string = process.env.LOGGING_MONGODB_PASSWORD;
      let loggingDatabaseName: string = process.env.LOGGING_MONGODB_DATABASE;
      let loggingUser: storageMongoDb.core.IMongoDbUser = {
        username: loggingUsername,
        password: loggingPassword,
        databaseName: loggingDatabaseName
      };

      checkMongoDbAvailabilityTask = TaskHelper.GetAwaitMongoDbAvailabilityTask(
        connection,
        loggingUser,
        5,
        5000,
        startupLoggerFactory
      );
    }

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
