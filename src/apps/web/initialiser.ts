import { Logger } from "winston";

import { BaseInititaliser } from "common/runtime/init";
import { IStartableApplication } from "common/runtime/application";
import { IWinstonConsoleConfiguration, IWinstonMongoDbConfiguration, IWinstonTelegramConfiguration, CreateLoggerAsync } from "common/logging/winston";
import { ExpressApplication, IExpressRoute } from "common/hosting/express";

import { DefaultRoute } from "./routes/defaultroute";
import { StatusRoute } from "./routes/statusroute";
import { DataExportRoute } from "./routes/dataexportroute";

export class Initialiser extends BaseInititaliser<IStartableApplication> {
  private LoadWinstonConsoleConfiguration(): IWinstonConsoleConfiguration {
    let consoleLevel: string = process.env.LOGGING_CONSOLE_LEVEL;

    return {
      level: consoleLevel
    };
  }

  private LoadWinstonMongoDbConfiguration(): IWinstonMongoDbConfiguration {
    let response: IWinstonMongoDbConfiguration = undefined;

    let useMongoDb: boolean = process.env.LOGGING_MONGODB_USE === "true";
    if (useMongoDb) {
      let mongoDbLevel: string = process.env.LOGGING_MONGODB_LEVEL;

      let host: string = process.env.LOGGING_MONGODB_HOST;
      let port: number = parseInt(process.env.LOGGING_MONGODB_PORT);
      let username: string = process.env.LOGGING_MONGODB_USERNAME;
      let password: string = process.env.LOGGING_MONGODB_PASSWORD;
      let databaseName: string = process.env.LOGGING_MONGODB_DATABASE;
      let collection: string = process.env.WEB_APP_NAME;

      response = {
        level: mongoDbLevel,
        connection: {
          host: host,
          port: port
        },
        user: {
          username: username,
          password: password,
          databaseName: databaseName
        },
        collection: collection
      };
    }

    return response;
  }

  private LoadWinstonTelegramConfiguration(): IWinstonTelegramConfiguration {
    let response: IWinstonTelegramConfiguration = undefined;

    let useTelegram: boolean = process.env.LOGGING_TELEGRAM_USE === "true";
    if (useTelegram) {
      let telegramLevel: string = process.env.LOGGING_TELEGRAM_LEVEL;

      let token: string = process.env.LOGGING_TELEGRAM_TOKEN;
      let chatId: number = parseInt(process.env.LOGGING_TELEGRAM_CHAT_ID);
      let disableNotification: boolean = process.env.LOGGING_TELEGRAM_DISABLE_NOTIFICATION === "true";

      response = {
        level: telegramLevel,
        token: token,
        chatId: chatId,
        disableNotification: disableNotification
      };
    }

    return response;
  }

  private async GetLoggerAsync(): Promise<Logger> {
    let consoleConfiguration: IWinstonConsoleConfiguration = this.LoadWinstonConsoleConfiguration();
    let mongoDbConfiguration: IWinstonMongoDbConfiguration = this.LoadWinstonMongoDbConfiguration();
    let telegramConfiguration: IWinstonTelegramConfiguration = this.LoadWinstonTelegramConfiguration();

    return await CreateLoggerAsync(consoleConfiguration, mongoDbConfiguration, telegramConfiguration);
  }

  protected async InitialiseInternalAsync(): Promise<IStartableApplication> {
    let logger: Logger = await this.GetLoggerAsync();

    let applicationName: string = process.env.WEB_APP_NAME;
    let port: number = parseInt(process.env.WEB_PORT || process.env.PORT);

    let defaultPath: string = process.env.WEB_DEFAULT_PATH || "/";
    let statusPath: string = process.env.WEB_STATUS_PATH;

    let routes: IExpressRoute[] = [new DefaultRoute(defaultPath, logger), new StatusRoute(statusPath, logger), new DataExportRoute("/products.csv", logger)];

    let application: IStartableApplication = new ExpressApplication(port, routes, undefined, applicationName, logger);
    return application;
  }
}
