import { Logger } from "winston";

import { BaseInititaliser } from "common/runtime/init";
import { IStartableApplication } from "common/runtime/application";
import { IWinstonConsoleConfiguration, IWinstonMongoDbConfiguration, IWinstonTelegramConfiguration, CreateLoggerAsync } from "common/logging/winston";
import { ExpressApplication, IExpressRoute, BaseSimpleGetExpressRoute } from "common/hosting/express";

import { DefaultRoute } from "./routes/defaultroute";
import { StatusRoute } from "./routes/statusroute";

export class Initialiser extends BaseInititaliser<IStartableApplication> {
  protected async InitialiseInternalAsync(): Promise<IStartableApplication> {
    let consoleLevel: string = process.env.LOGGING_CONSOLE_LEVEL;

    let consoleConfiguration: IWinstonConsoleConfiguration = {
      level: consoleLevel
    };

    let mongoDbConfiguration: IWinstonMongoDbConfiguration = undefined;

    let useMongoDb: boolean = process.env.LOGGING_MONGODB_USE === "true";
    if (useMongoDb) {
      let mongoDbLevel: string = process.env.LOGGING_MONGODB_LEVEL;

      let host: string = process.env.MONGODB_HOST;
      let port: number = parseInt(process.env.LOGGING_MONGODB_PORT);
      let username: string = process.env.LOGGING_MONGODB_USERNAME;
      let password: string = process.env.LOGGING_MONGODB_PASSWORD;
      let databaseName: string = process.env.LOGGING_MONGODB_DATABASE;
      let collection: string = process.env.PINGLISTENER_APP_NAME;

      mongoDbConfiguration = {
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

    let telegramConfiguration: IWinstonTelegramConfiguration = undefined;

    let useTelegram: boolean = process.env.LOGGING_TELEGRAM_USE === "true";
    if (useTelegram) {
      let telegramLevel: string = process.env.LOGGING_TELEGRAM_LEVEL;

      let botToken: string = process.env.LOGGING_TELEGRAM_BOT_TOKEN;
      let chatId: number = parseInt(process.env.LOGGING_TELEGRAM_CHAT_ID);
      let disableNotification: boolean = process.env.LOGGING_TELEGRAM_DISABLE_NOTIFICATION === "true";

      telegramConfiguration = {
        level: telegramLevel,
        botToken: botToken,
        chatId: chatId,
        disableNotification: disableNotification
      };
    }

    let logger: Logger = await CreateLoggerAsync(consoleConfiguration, mongoDbConfiguration, telegramConfiguration);

    let applicationName: string = process.env.WEB_APP_NAME;
    let host: string = process.env.WEB_HOST || "0.0.0.0";
    let port: number = parseInt(process.env.WEB_PORT || process.env.PORT);

    let path: string = process.env.WEB_PATH || "/";
    let satusPath: string = process.env.WEB_STATUS_PATH;

    let routes: IExpressRoute[] = [new DefaultRoute(path, logger), new StatusRoute(satusPath, logger)];

    let application: IStartableApplication = new ExpressApplication(host, port, routes, applicationName, logger);
    return application;
  }
}
