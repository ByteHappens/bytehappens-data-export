import { logging, runtime, application, task } from "bytehappens";
import { mongodb } from "bytehappens-storage-mongodb";
import { loggingWinston, loggingConsole, loggingTelegram, loggingMongoDb } from "bytehappens-logging-winston";

import { ExpressApplication, IExpressRoute } from "common/hosting/express";

import { CreateMongoDbLogUserTask } from "./tasks/createmongodbusertask";

import { DefaultRoute } from "./routes/defaultroute";
import { StatusRoute } from "./routes/statusroute";
import { DataExportRoute } from "./routes/dataexportroute";

export class RuntimeFactory<
  TLog extends logging.ILog,
  TLogger extends loggingWinston.WinstonLogger<TLog>,
  TLoggerFactory extends loggingWinston.WinstonLoggerFactory<TLog, TLogger>,
  TSetupLoggerFactory extends loggingConsole.WinstonConsoleLoggerFactory<TLog>
> implements runtime.IRuntimeFactory<task.ITask> {
  private LoadWinstonConsoleTransportConfiguration(): loggingConsole.IWinstonConsoleTransportConfiguration {
    let level: string = process.env.LOGGING_CONSOLE_LEVEL;
    return new loggingConsole.WinstonConsoleTransportConfiguration(level);
  }

  private LoadWinstonTelegramTransportConfiguration(): loggingTelegram.IWinstonTelegramTransportConfiguration {
    let response: loggingTelegram.IWinstonTelegramTransportConfiguration = undefined;

    let useTelegram: boolean = process.env.LOGGING_TELEGRAM_USE === "true";
    if (useTelegram) {
      let level: string = process.env.LOGGING_TELEGRAM_LEVEL;
      let token: string = process.env.LOGGING_TELEGRAM_TOKEN;
      let chatId: number = parseInt(process.env.LOGGING_TELEGRAM_CHAT_ID);
      let disableNotification: boolean = process.env.LOGGING_TELEGRAM_DISABLE_NOTIFICATION === "true";

      response = new loggingTelegram.WinstonTelegramTransportConfiguration(token, chatId, disableNotification, level);
    }

    return response;
  }

  private LoadWinstonMongoDbTransportConfiguration(): loggingMongoDb.IWinstonMongoDbTransportConfiguration {
    let response: loggingMongoDb.IWinstonMongoDbTransportConfiguration = undefined;

    let useMongoDb: boolean = process.env.LOGGING_MONGODB_USE === "true";
    if (useMongoDb) {
      let level: string = process.env.LOGGING_MONGODB_LEVEL;
      let host: string = process.env.LOGGING_MONGODB_HOST;
      let port: number = parseInt(process.env.LOGGING_MONGODB_PORT);
      let username: string = process.env.LOGGING_MONGODB_USERNAME;
      let password: string = process.env.LOGGING_MONGODB_PASSWORD;
      let databaseName: string = process.env.LOGGING_MONGODB_DATABASE;
      let collection: string = process.env.WEB_APP_NAME;

      response = new loggingMongoDb.WinstonMongoDbTransportConfiguration(
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
    current: loggingWinston.IWinstonTransportConfiguration,
    existing: loggingWinston.IWinstonTransportConfiguration[],
    setupLogger: loggingWinston.WinstonLogger<TLog>
  ) {
    if (current) {
      try {
        current.Validate();
        existing.push(current);
      } catch (error) {
        setupLogger.Log(<TLog>{
          level: "error",
          message: "Failed to load add transport configuration",
          meta: { error }
        });
        //  EBU: How to log ?
      }
    }
  }

  private async GetLoggerFactoryAsync(setupLoggerFactory: TSetupLoggerFactory): Promise<TLoggerFactory> {
    let setupLogger: loggingWinston.WinstonLogger<TLog> = await setupLoggerFactory.CreateLoggerAsync();
    let transportConfigurations: loggingWinston.IWinstonTransportConfiguration[] = [];

    let consoleTransportConfiguration: loggingConsole.IWinstonConsoleTransportConfiguration = this.LoadWinstonConsoleTransportConfiguration();
    this.AddTransportConfiguration(consoleTransportConfiguration, transportConfigurations, setupLogger);

    let telegramTransportConfiguration: loggingTelegram.IWinstonTelegramTransportConfiguration = this.LoadWinstonTelegramTransportConfiguration();
    this.AddTransportConfiguration(telegramTransportConfiguration, transportConfigurations, setupLogger);

    let mongoDbTransportConfiguration: loggingMongoDb.IWinstonMongoDbTransportConfiguration = this.LoadWinstonMongoDbTransportConfiguration();
    this.AddTransportConfiguration(mongoDbTransportConfiguration, transportConfigurations, setupLogger);

    return <TLoggerFactory>(
      new loggingWinston.WinstonLoggerFactory(consoleTransportConfiguration.level, transportConfigurations)
    );
  }

  private GetCreateMongoDbLogUserTask(setupLoggerFactory: TSetupLoggerFactory): task.ITask {
    let response: task.ITask;

    let useMongoDb: boolean = process.env.LOGGING_MONGODB_USE === "true";
    if (useMongoDb) {
      let host: string = process.env.LOGGING_MONGODB_HOST;
      let port: number = parseInt(process.env.LOGGING_MONGODB_PORT);
      let connection: mongodb.IMongoDbConnection = {
        host: host,
        port: port
      };

      let username: string = process.env.LOGGING_MONGODB_ADMIN_USERNAME;
      let password: string = process.env.LOGGING_MONGODB_ADMIN_PASSWORD;
      let user: mongodb.IMongoDbUser = {
        username: username,
        password: password
      };

      let newUsername: string = process.env.LOGGING_MONGODB_USERNAME;
      let newPassword: string = process.env.LOGGING_MONGODB_PASSWORD;
      let databaseName: string = process.env.LOGGING_MONGODB_DATABASE;
      let newUser: mongodb.IMongoDbUser = {
        username: newUsername,
        password: newPassword,
        databaseName: databaseName
      };

      response = new CreateMongoDbLogUserTask(connection, user, newUser, "CreateMongoDbLogUser", setupLoggerFactory);
      response = new task.RetriableTask(response, 2, 10000, "RetryCreateMongoDbLogUser", setupLoggerFactory);
    }

    return response;
  }

  private GetExpressApplicationTask(
    loggerFactory: TLoggerFactory,
    startupLoggerFactory: loggingConsole.WinstonConsoleLoggerFactory<TLog>
  ): task.ITask {
    let applicationName: string = process.env.WEB_APP_NAME;
    let port: number = parseInt(process.env.WEB_PORT || process.env.PORT);

    let defaultPath: string = process.env.WEB_DEFAULT_PATH || "/";
    let statusPath: string = process.env.WEB_STATUS_PATH;

    let routes: IExpressRoute[] = [
      new DefaultRoute(defaultPath, loggerFactory),
      new StatusRoute(statusPath, loggerFactory),
      new DataExportRoute("/products.csv", loggerFactory)
    ];

    let application: application.IApplication = new ExpressApplication(port, routes, undefined, applicationName, loggerFactory);
    let applicationTask: task.ITask = new task.ApplicationTask(application, `Start${applicationName}`, startupLoggerFactory);
    return applicationTask;
  }

  public async CreateRuntimeAsync(): Promise<task.ITask> {
    let response: task.ITask;

    let consoleTransportConfiguration: loggingConsole.IWinstonConsoleTransportConfiguration = this.LoadWinstonConsoleTransportConfiguration();
    let setupLoggerFactory: TSetupLoggerFactory = <TSetupLoggerFactory>(
      new loggingConsole.WinstonConsoleLoggerFactory<TLog>(consoleTransportConfiguration.level, consoleTransportConfiguration)
    );

    let loggerFactory: TLoggerFactory = await this.GetLoggerFactoryAsync(setupLoggerFactory);

    let createMongoDbLogUserTask: task.ITask = this.GetCreateMongoDbLogUserTask(setupLoggerFactory);
    let serverTask: task.ITask = this.GetExpressApplicationTask(loggerFactory, setupLoggerFactory);

    if (createMongoDbLogUserTask) {
      //  EBU: Start Server regardless of success
      response = new task.TaskChain(createMongoDbLogUserTask, serverTask, serverTask, "SetupTaskChain", setupLoggerFactory);
    } else {
      response = serverTask;
    }

    return response;
  }
}
