import { MongoClient } from "mongodb";
import { logging, runtimes } from "bytehappens";
import { storageMongoDb } from "bytehappens-storage-mongodb";
import { loggingWinston } from "bytehappens-logging-winston";

import { ExpressApplication, IExpressRoute } from "common/hosting/express";

import { DefaultRoute } from "../routes/defaultroute";
import { StatusRoute } from "../routes/statusroute";
import { DataExportRoute } from "../routes/dataexportroute";

export function GetCheckMongoDbAvailabilityTask<
  TLog extends logging.ILog,
  TStartupLoggerFactory extends loggingWinston.console.WinstonConsoleLoggerFactory<TLog>
>(
  startupLoggerFactory: TStartupLoggerFactory,
  connection: storageMongoDb.core.IMongoDbConnection,
  user: storageMongoDb.core.IMongoDbUser
): runtimes.tasks.ITask {
  let response: runtimes.tasks.ITask = new runtimes.tasks.LambdaTask(
    async () => {
      //  SCK: If we can create client, then it is available
      let client: MongoClient = await storageMongoDb.core.CreateMongoDbClientAsync(connection, user);
      return true;
    },
    "CheckMongoDbAvailabilityTask",
    startupLoggerFactory
  );

  response = new runtimes.tasks.RetriableTask(response, 5, 5000, "RetryCheckMongoDbAvailabilityTask", startupLoggerFactory);

  return response;
}

export function GetExpressApplicationTask<
  TLog extends logging.ILog,
  TLogger extends loggingWinston.core.WinstonLogger<TLog>,
  TRuntimeLoggerFactory extends loggingWinston.core.WinstonLoggerFactory<TLog, TLogger>,
  TStartupLoggerFactory extends loggingWinston.console.WinstonConsoleLoggerFactory<TLog>
>(loggerFactory: TRuntimeLoggerFactory, startupLoggerFactory: TStartupLoggerFactory): runtimes.tasks.ITask {
  let applicationName: string = process.env.WEB_APP_NAME;
  let port: number = parseInt(process.env.WEB_PORT || process.env.PORT);

  let defaultPath: string = process.env.WEB_DEFAULT_PATH || "/";
  let statusPath: string = process.env.WEB_STATUS_PATH;

  let routes: IExpressRoute[] = [
    new DefaultRoute(defaultPath, loggerFactory),
    new StatusRoute(statusPath, loggerFactory),
    new DataExportRoute("/products.csv", loggerFactory)
  ];

  let application: runtimes.applications.IApplication = new ExpressApplication(
    port,
    routes,
    undefined,
    applicationName,
    loggerFactory
  );

  let startApplicationTask: runtimes.tasks.ITask = new runtimes.tasks.StartApplicationTask(
    application,
    `Start${applicationName}`,
    startupLoggerFactory
  );

  return startApplicationTask;
}
