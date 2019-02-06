import { BaseInititaliser } from "common/runtime/init";

import { IStartableApplication } from "common/runtime/application";
import { ITask, TaskChain, StartApplication } from "common/runtime/task";

import { IWinstonTransportConfiguration, IWinstonLoggerFactory, WinstonLoggerFactory } from "common/logging/winston";
import { IWinstonConsoleTransportConfiguration, WinstonConsoleTransportConfiguration } from "common/logging/winston/console";
import { IWinstonMongoDbTransportConfiguration, WinstonMongoDbTransportConfiguration } from "common/logging/winston/mongodb";
import { IWinstonTelegramTransportConfiguration, WinstonTelegramTransportConfiguration } from "common/logging/winston/telegram";

import { IMongoDbConnection, IMongoDbUser } from "common/storage/mongodb";

import { ExpressApplication, IExpressRoute } from "common/hosting/express";

import { CreateMongoDbLogUserTask } from "./tasks/createmongodbusertask";

import { DefaultRoute } from "./routes/defaultroute";
import { StatusRoute } from "./routes/statusroute";
import { DataExportRoute } from "./routes/dataexportroute";

export class Initialiser extends BaseInititaliser<ITask> {
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

  private AddTransportConfiguration(current: IWinstonTransportConfiguration, existing: IWinstonTransportConfiguration[]) {
    if (current) {
      try {
        current.Validate();
        existing.push(current);
      } catch (error) {
        //  EBU: How to log ?
      }
    }
  }

  private GetLightWinstonLoggerFactory(): IWinstonLoggerFactory {
    let transportConfigurations: IWinstonTransportConfiguration[] = [];

    let consoleTransportConfiguration: IWinstonConsoleTransportConfiguration = this.LoadWinstonConsoleTransportConfiguration();
    this.AddTransportConfiguration(consoleTransportConfiguration, transportConfigurations);

    return new WinstonLoggerFactory(consoleTransportConfiguration.level, transportConfigurations);
  }

  private GetWinstonLoggerFactory(): IWinstonLoggerFactory {
    let transportConfigurations: IWinstonTransportConfiguration[] = [];

    let consoleTransportConfiguration: IWinstonConsoleTransportConfiguration = this.LoadWinstonConsoleTransportConfiguration();
    this.AddTransportConfiguration(consoleTransportConfiguration, transportConfigurations);

    let mongoDbTransportConfiguration: IWinstonMongoDbTransportConfiguration = this.LoadWinstonMongoDbTransportConfiguration();
    this.AddTransportConfiguration(mongoDbTransportConfiguration, transportConfigurations);

    let telegramTransportConfiguration: IWinstonTelegramTransportConfiguration = this.LoadWinstonTelegramTransportConfiguration();
    this.AddTransportConfiguration(telegramTransportConfiguration, transportConfigurations);

    return new WinstonLoggerFactory(consoleTransportConfiguration.level, transportConfigurations);
  }

  private GetCreateMongoDbLogUserTask(lightWinstonLoggerFactory: IWinstonLoggerFactory): ITask {
    let response: ITask;

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

      response = new CreateMongoDbLogUserTask(connection, user, newUser, "CreateMongoDbLogUser", lightWinstonLoggerFactory);
    } else {
    }

    return response;
  }

  private GetExpressApplicationTask(
    winstonLoggerFactory: IWinstonLoggerFactory,
    lightWinstonLoggerFactory: IWinstonLoggerFactory
  ): ITask {
    let applicationName: string = process.env.WEB_APP_NAME;
    let port: number = parseInt(process.env.WEB_PORT || process.env.PORT);

    let defaultPath: string = process.env.WEB_DEFAULT_PATH || "/";
    let statusPath: string = process.env.WEB_STATUS_PATH;

    let routes: IExpressRoute[] = [
      new DefaultRoute(defaultPath),
      new StatusRoute(statusPath),
      new DataExportRoute("/products.csv")
    ];

    let application: IStartableApplication = new ExpressApplication(
      port,
      routes,
      undefined,
      applicationName,
      winstonLoggerFactory
    );
    let task: StartApplication = new StartApplication(application, `Start${applicationName}`, lightWinstonLoggerFactory);
    return task;
  }

  protected async InitialiseInternalAsync(): Promise<ITask> {
    let winstonLoggerFactory: IWinstonLoggerFactory = this.GetWinstonLoggerFactory();
    let lightWinstonLoggerFactory: IWinstonLoggerFactory = this.GetLightWinstonLoggerFactory();

    let createMongoDbLogUserTask: ITask = this.GetCreateMongoDbLogUserTask(lightWinstonLoggerFactory);
    let serverTask: ITask = this.GetExpressApplicationTask(winstonLoggerFactory, lightWinstonLoggerFactory);

    //  EBU: Start Server regardless of success
    let response: ITask = new TaskChain(
      createMongoDbLogUserTask,
      serverTask,
      serverTask,
      "TaskChain",
      lightWinstonLoggerFactory
    );

    return response;
  }
}
