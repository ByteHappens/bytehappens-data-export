import { logging, runtime, application, task } from "bytehappens";

import { IWinstonTransportConfiguration, WinstonLoggerFactory, WinstonLogger } from "common/logging/winston";
import {
  IWinstonConsoleTransportConfiguration,
  WinstonConsoleTransportConfiguration,
  WinstonConsoleLoggerFactory
} from "common/logging/winston/console";
import { IWinstonMongoDbTransportConfiguration, WinstonMongoDbTransportConfiguration } from "common/logging/winston/mongodb";
import { IWinstonTelegramTransportConfiguration, WinstonTelegramTransportConfiguration } from "common/logging/winston/telegram";
import { IMongoDbConnection, IMongoDbUser } from "common/storage/mongodb";
import { ExpressApplication, IExpressRoute } from "common/hosting/express";

import { CreateMongoDbLogUserTask } from "./tasks/createmongodbusertask";

import { DefaultRoute } from "./routes/defaultroute";
import { StatusRoute } from "./routes/statusroute";
import { DataExportRoute } from "./routes/dataexportroute";

export class RuntimeFactory<
  TLog extends logging.ILog,
  TLogger extends WinstonLogger<TLog>,
  TLoggerFactory extends WinstonLoggerFactory<TLog, TLogger>,
  TSetupLoggerFactory extends WinstonConsoleLoggerFactory<TLog>
> implements runtime.IRuntimeFactory<task.ITask> {
  private LoadWinstonConsoleTransportConfiguration(): IWinstonConsoleTransportConfiguration {
    let level: string = process.env.LOGGING_CONSOLE_LEVEL;
    return new WinstonConsoleTransportConfiguration(level);
  }

  private LoadWinstonMongoDbTransportConfiguration(): IWinstonMongoDbTransportConfiguration {
    let response: IWinstonMongoDbTransportConfiguration = undefined;

    let useMongoDb: boolean = process.env.LOGGING_MONGODB_USE === "true";
    if (useMongoDb) {
      let level: string = process.env.LOGGING_MONGODB_LEVEL;
      let host: string = process.env.LOGGING_MONGODB_HOST;
      let port: number = parseInt(process.env.LOGGING_MONGODB_PORT);
      let username: string = process.env.LOGGING_MONGODB_USERNAME;
      let password: string = process.env.LOGGING_MONGODB_PASSWORD;
      let databaseName: string = process.env.LOGGING_MONGODB_DATABASE;
      let collection: string = process.env.WEB_APP_NAME;

      response = new WinstonMongoDbTransportConfiguration(
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

  private LoadWinstonTelegramTransportConfiguration(): IWinstonTelegramTransportConfiguration {
    let response: IWinstonTelegramTransportConfiguration = undefined;

    let useTelegram: boolean = process.env.LOGGING_TELEGRAM_USE === "true";
    if (useTelegram) {
      let level: string = process.env.LOGGING_TELEGRAM_LEVEL;
      let token: string = process.env.LOGGING_TELEGRAM_TOKEN;
      let chatId: number = parseInt(process.env.LOGGING_TELEGRAM_CHAT_ID);
      let disableNotification: boolean = process.env.LOGGING_TELEGRAM_DISABLE_NOTIFICATION === "true";

      response = new WinstonTelegramTransportConfiguration(token, chatId, disableNotification, level);
    }

    return response;
  }

  private AddTransportConfiguration(
    current: IWinstonTransportConfiguration,
    existing: IWinstonTransportConfiguration[],
    setupLogger: WinstonLogger<TLog>
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
    let setupLogger: WinstonLogger<TLog> = await setupLoggerFactory.CreateLoggerAsync();
    let transportConfigurations: IWinstonTransportConfiguration[] = [];

    let consoleTransportConfiguration: IWinstonConsoleTransportConfiguration = this.LoadWinstonConsoleTransportConfiguration();
    this.AddTransportConfiguration(consoleTransportConfiguration, transportConfigurations, setupLogger);

    let mongoDbTransportConfiguration: IWinstonMongoDbTransportConfiguration = this.LoadWinstonMongoDbTransportConfiguration();
    this.AddTransportConfiguration(mongoDbTransportConfiguration, transportConfigurations, setupLogger);

    let telegramTransportConfiguration: IWinstonTelegramTransportConfiguration = this.LoadWinstonTelegramTransportConfiguration();
    this.AddTransportConfiguration(telegramTransportConfiguration, transportConfigurations, setupLogger);

    return <TLoggerFactory>new WinstonLoggerFactory(consoleTransportConfiguration.level, transportConfigurations);
  }

  private GetCreateMongoDbLogUserTask(setupLoggerFactory: TSetupLoggerFactory): task.ITask {
    let response: task.ITask;

    let useMongoDb: boolean = process.env.LOGGING_MONGODB_USE === "true";
    if (useMongoDb) {
      let host: string = process.env.LOGGING_MONGODB_HOST;
      let port: number = parseInt(process.env.LOGGING_MONGODB_PORT);
      let connection: IMongoDbConnection = {
        host: host,
        port: port
      };

      let username: string = process.env.LOGGING_MONGODB_ADMIN_USERNAME;
      let password: string = process.env.LOGGING_MONGODB_ADMIN_PASSWORD;
      let user: IMongoDbUser = {
        username: username,
        password: password
      };

      let newUsername: string = process.env.LOGGING_MONGODB_USERNAME;
      let newPassword: string = process.env.LOGGING_MONGODB_PASSWORD;
      let databaseName: string = process.env.LOGGING_MONGODB_DATABASE;
      let newUser: IMongoDbUser = {
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
    startupLoggerFactory: WinstonConsoleLoggerFactory<TLog>
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

    let consoleTransportConfiguration: IWinstonConsoleTransportConfiguration = this.LoadWinstonConsoleTransportConfiguration();
    let setupLoggerFactory: TSetupLoggerFactory = <TSetupLoggerFactory>(
      new WinstonConsoleLoggerFactory<TLog>(consoleTransportConfiguration.level, consoleTransportConfiguration)
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
