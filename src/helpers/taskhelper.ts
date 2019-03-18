import { logging, runtimes } from "bytehappens";
import { storageMongoDb } from "bytehappens-storage-mongodb";
import { loggingWinston } from "bytehappens-logging-winston";

import { ExpressApplication, IExpressRoute } from "common/hosting/express";

import { StaticFileProvider, StaticFieldProvider, StaticEntryProvider } from "../data";

import { DefaultRoute } from "../routes/defaultroute";
import { StatusRoute } from "../routes/statusroute";
import { DataExportRoute } from "../routes/dataexportroute";

export function GetAwaitMongoDbAvailabilityTask<
  TLog extends logging.ILog,
  TStartupLoggerFactory extends loggingWinston.console.WinstonConsoleLoggerFactory<TLog>
>(
  connection: storageMongoDb.core.IMongoDbConnection,
  user: storageMongoDb.core.IMongoDbUser,
  maxAttempts: number,
  delayInMs: number,
  startupLoggerFactory: TStartupLoggerFactory
): runtimes.tasks.ITask {
  return new storageMongoDb.core.AwaitMongoDbAvailabilityTask(connection, user, maxAttempts, delayInMs, startupLoggerFactory);
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
    new DataExportRoute(
      new StaticFileProvider(),
      new StaticFieldProvider(),
      new StaticEntryProvider(),
      "/:filename([^.]+).:ext(json|csv)",
      loggerFactory
    ),
    new DataExportRoute(
      new StaticFileProvider(),
      new StaticFieldProvider(),
      new StaticEntryProvider(),
      "/:filename([^.]+)",
      loggerFactory
    )
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
