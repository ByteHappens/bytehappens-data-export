import { MongoClient } from "mongodb";
import { logging, runtimes } from "bytehappens";
import { storageMongoDb } from "bytehappens-storage-mongodb";
import { loggingWinston } from "bytehappens-logging-winston";

import { ExpressApplication, IExpressRoute } from "common/hosting/express";

import { DefaultRoute } from "./routes/defaultroute";
import { StatusRoute } from "./routes/statusroute";
import { DataExportRoute } from "./routes/dataexportroute";

export class RuntimeFactory<
  TLog extends logging.ILog,
  TLogger extends loggingWinston.core.WinstonLogger<TLog>,
  TLoggerFactory extends loggingWinston.core.WinstonLoggerFactory<TLog, TLogger>,
  TstartupLoggerFactory extends loggingWinston.console.WinstonConsoleLoggerFactory<TLog>
> implements runtimes.core.IRuntimeFactory<runtimes.tasks.ITask> {
  private LoadWinstonConsoleTransportConfiguration(): loggingWinston.console.IWinstonConsoleTransportConfiguration {
    let level: string = process.env.LOGGING_CONSOLE_LEVEL;
    return new loggingWinston.console.WinstonConsoleTransportConfiguration(level);
  }

  private LoadWinstonTelegramTransportConfiguration(): loggingWinston.telegram.IWinstonTelegramTransportConfiguration {
    let response: loggingWinston.telegram.IWinstonTelegramTransportConfiguration = undefined;

    let useTelegram: boolean = process.env.LOGGING_TELEGRAM_USE === "true";
    if (useTelegram) {
      let level: string = process.env.LOGGING_TELEGRAM_LEVEL;
      let token: string = process.env.LOGGING_TELEGRAM_TOKEN;
      let chatId: number = parseInt(process.env.LOGGING_TELEGRAM_CHAT_ID);
      let disableNotification: boolean = process.env.LOGGING_TELEGRAM_DISABLE_NOTIFICATION === "true";

      response = new loggingWinston.telegram.WinstonTelegramTransportConfiguration(token, chatId, disableNotification, level);
    }

    return response;
  }

  private LoadWinstonMongoDbTransportConfiguration(): loggingWinston.mongodb.IWinstonMongoDbTransportConfiguration {
    let response: loggingWinston.mongodb.IWinstonMongoDbTransportConfiguration = undefined;

    let useMongoDb: boolean = process.env.LOGGING_MONGODB_USE === "true";
    if (useMongoDb) {
      let level: string = process.env.LOGGING_MONGODB_LEVEL;
      let host: string = process.env.LOGGING_MONGODB_HOST;
      let port: number = parseInt(process.env.LOGGING_MONGODB_PORT);
      let username: string = process.env.LOGGING_MONGODB_USERNAME;
      let password: string = process.env.LOGGING_MONGODB_PASSWORD;
      let databaseName: string = process.env.LOGGING_MONGODB_DATABASE;
      let collection: string = process.env.WEB_APP_NAME;

      response = new loggingWinston.mongodb.WinstonMongoDbTransportConfiguration(
        {
          host: host,
          port: port
        },
        {
          username: username,
          password: password,
          databaseName: databaseName
        },
        collection,
        level
      );
    }

    return response;
  }

  private AddTransportConfiguration(
    current: loggingWinston.core.IWinstonTransportConfiguration,
    existing: loggingWinston.core.IWinstonTransportConfiguration[],
    startupLogger: loggingWinston.core.WinstonLogger<TLog>
  ) {
    if (current) {
      try {
        current.Validate();
        existing.push(current);
      } catch (error) {
        startupLogger.Log(<TLog>{
          level: "error",
          message: "Failed to load add transport configuration",
          meta: { error }
        });
        //  EBU: How to log ?
      }
    }
  }

  private async GetLoggerFactoryAsync(startupLoggerFactory: TstartupLoggerFactory): Promise<TLoggerFactory> {
    let startupLogger: loggingWinston.core.WinstonLogger<TLog> = await startupLoggerFactory.CreateLoggerAsync();
    let transportConfigurations: loggingWinston.core.IWinstonTransportConfiguration[] = [];

    let consoleTransportConfiguration: loggingWinston.console.IWinstonConsoleTransportConfiguration = this.LoadWinstonConsoleTransportConfiguration();
    this.AddTransportConfiguration(consoleTransportConfiguration, transportConfigurations, startupLogger);

    let telegramTransportConfiguration: loggingWinston.telegram.IWinstonTelegramTransportConfiguration = this.LoadWinstonTelegramTransportConfiguration();
    this.AddTransportConfiguration(telegramTransportConfiguration, transportConfigurations, startupLogger);

    let mongoDbTransportConfiguration: loggingWinston.mongodb.IWinstonMongoDbTransportConfiguration = this.LoadWinstonMongoDbTransportConfiguration();
    this.AddTransportConfiguration(mongoDbTransportConfiguration, transportConfigurations, startupLogger);

    return <TLoggerFactory>(
      new loggingWinston.core.WinstonLoggerFactory(consoleTransportConfiguration.level, transportConfigurations)
    );
  }

  private GetCheckMongoDbAvailabilityTask(
    startupLoggerFactory: loggingWinston.console.WinstonConsoleLoggerFactory<TLog>
  ): runtimes.tasks.ITask {
    let response: runtimes.tasks.ITask;

    let useMongoDb: boolean = process.env.LOGGING_MONGODB_USE === "true";
    if (useMongoDb) {
      let host: string = process.env.LOGGING_MONGODB_HOST;
      let port: number = parseInt(process.env.LOGGING_MONGODB_PORT);
      let connection: storageMongoDb.core.IMongoDbConnection = {
        host: host,
        port: port
      };

      let newUsername: string = process.env.LOGGING_MONGODB_USERNAME;
      let newPassword: string = process.env.LOGGING_MONGODB_PASSWORD;
      let databaseName: string = process.env.LOGGING_MONGODB_DATABASE;
      let newUser: storageMongoDb.core.IMongoDbUser = {
        username: newUsername,
        password: newPassword,
        databaseName: databaseName
      };

      let checkMongoDbAvailabilityTask: runtimes.tasks.ITask = new runtimes.tasks.LambdaTask(
        async () => {
          //  SCK: If we can create client, then it is available
          let client: MongoClient = await storageMongoDb.core.CreateMongoDbClientAsync(connection, newUser);
          return true;
        },
        "CheckMongoDbAvailabilityTask",
        startupLoggerFactory
      );

      response = new runtimes.tasks.RetriableTask(
        checkMongoDbAvailabilityTask,
        5,
        5000,
        "RetryCheckMongoDbAvailabilityTask",
        startupLoggerFactory
      );
    }

    return response;
  }

  private GetExpressApplicationTask(
    loggerFactory: TLoggerFactory,
    startupLoggerFactory: loggingWinston.console.WinstonConsoleLoggerFactory<TLog>
  ): runtimes.tasks.ITask {
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

  public async CreateRuntimeAsync(): Promise<runtimes.tasks.ITask> {
    let response: runtimes.tasks.ITask;

    let consoleTransportConfiguration: loggingWinston.console.IWinstonConsoleTransportConfiguration = this.LoadWinstonConsoleTransportConfiguration();
    let startupLoggerFactory: TstartupLoggerFactory = <TstartupLoggerFactory>(
      new loggingWinston.console.WinstonConsoleLoggerFactory<TLog>(
        consoleTransportConfiguration.level,
        consoleTransportConfiguration
      )
    );

    let loggerFactory: TLoggerFactory = await this.GetLoggerFactoryAsync(startupLoggerFactory);

    let checkMongoDbAvailabilityTask: runtimes.tasks.ITask = this.GetCheckMongoDbAvailabilityTask(startupLoggerFactory);
    let applicationTask: runtimes.tasks.ITask = this.GetExpressApplicationTask(loggerFactory, startupLoggerFactory);

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
