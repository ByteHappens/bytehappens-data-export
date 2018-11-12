require('module-alias/register')

import { Logger } from "winston";
import * as express from "express";

import { InitialiseEnvironmentAsync } from "common/runtime/init";
import { IStartableApplication } from "common/runtime/application";
import { IWinstonMongoDbConnection, IWinstonTelegramConnection, CreateLoggerAsync } from "common/logging/winston";
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

async function GetAppAsync(): Promise<IStartableApplication> {
  await InitialiseEnvironmentAsync();

  let winstonMongoDbConnection: IWinstonMongoDbConnection = undefined;

  let useMongoDb: boolean = process.env.LOGGING_MONGODB_USE === "true";
  if (useMongoDb) {
    let host: string = process.env.MONGODB_HOST;
    let port: number = parseInt(process.env.LOGGING_MONGODB_PORT);
    let databaseName: string = process.env.LOGGING_MONGODB_DATABASE;
    let username: string = process.env.LOGGING_MONGODB_USERNAME;
    let password: string = process.env.LOGGING_MONGODB_PASSWORD;
    let collection: string = process.env.PINGLISTENER_APP_NAME;

    winstonMongoDbConnection = {
      mongoDbConnection: {
        host: host,
        port: port
      },
      mongoDbUserConfiguration: {
        username: username,
        password: password,
        databaseName: databaseName
      },
      collection: collection
    };
  }

  let winstonTelegramConnection: IWinstonTelegramConnection = undefined;

  let useTelegram: boolean = process.env.LOGGING_TELEGRAM_USE === "true";
  if (useTelegram) {
    let botToken: string = process.env.LOGGING_TELEGRAM_BOT_TOKEN;
    let chatId: number = parseInt(process.env.LOGGING_TELEGRAM_CHAT_ID);

    winstonTelegramConnection = {
      botToken: botToken,
      chatId: chatId
    };
  }

  let logger: Logger = await CreateLoggerAsync(winstonMongoDbConnection, winstonTelegramConnection);

  let applicationName: string = process.env.DATAEXPORT_APP_NAME;
  let host: string = process.env.DATAEXPORT_HOST || "0.0.0.0";
  let port: number = parseInt(process.env.DATAEXPORT_PORT || process.env.PORT);

  let path: string = process.env.DATAEXPORT_PATH || "/";
  let satusPath: string = process.env.DATAEXPORT_STATUS_PATH;

  let routes: IExpressRoute[] = [new DataExportRoute(path, logger), new StatusRoute(satusPath, logger)];

  return new ExpressApplication(host, port, routes, applicationName, logger);
}

GetAppAsync().then(app => app.Start());
