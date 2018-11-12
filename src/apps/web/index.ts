require("module-alias/register");

import { Logger } from "winston";
import * as express from "express";

import { InititaliserBase } from "common/runtime/init";
import { IStartableApplication } from "common/runtime/application";
import { IWinstonConsoleConfiguration, IWinstonMongoDbConfiguration, IWinstonTelegramConfiguration, CreateLoggerAsync } from "common/logging/winston";
import { ExpressApplication, IExpressRoute, BaseExpressRoute } from "common/hosting/express";

class DataExportRoute extends BaseExpressRoute {
  protected ProcessRequestInternal(request: express.Request, response: express.Response): void {
    response.status(200);
    response.send("I'm alive !");
  }
}

class StatusRoute extends BaseExpressRoute {
  protected ProcessRequestInternal(request: express.Request, response: express.Response): void {
    response.status(204);
    response.send();
  }
}

class Initialiser extends InititaliserBase<IStartableApplication> {
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

      telegramConfiguration = {
        level: telegramLevel,
        botToken: botToken,
        chatId: chatId
      };
    }

    let logger: Logger = await CreateLoggerAsync(consoleConfiguration, mongoDbConfiguration, telegramConfiguration);

    let applicationName: string = process.env.DATAEXPORT_APP_NAME;
    let host: string = process.env.DATAEXPORT_HOST || "0.0.0.0";
    let port: number = parseInt(process.env.DATAEXPORT_PORT || process.env.PORT);

    let path: string = process.env.DATAEXPORT_PATH || "/";
    let satusPath: string = process.env.DATAEXPORT_STATUS_PATH;

    let routes: IExpressRoute[] = [new DataExportRoute(path, logger), new StatusRoute(satusPath, logger)];

    let application: IStartableApplication = new ExpressApplication(host, port, routes, applicationName, logger);
    return application;
  }
}

let initialser = new Initialiser();
initialser.InitialiseAsync().then(application => application.Start());
