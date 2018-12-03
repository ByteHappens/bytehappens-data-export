import { Logger } from "winston";

import { IWinstonConsoleConfiguration } from "../interfaces/iwinstonconsoleconfiguration";
import { IWinstonMongoDbConfiguration } from "../interfaces/iwinstonmongodbconfiguration";
import { IWinstonTelegramConfiguration } from "../interfaces/iwinstontelegramconfiguration";

import { InitDefaultLogger, InitMongoTransportAsync, InitTelegramTransport } from "./init";

export async function CreateLoggerAsync(
  consoleConfiguration: IWinstonConsoleConfiguration,
  mongoDbConfiguration?: IWinstonMongoDbConfiguration,
  telegramConnection?: IWinstonTelegramConfiguration
): Promise<Logger> {
  let response: Logger = InitDefaultLogger(consoleConfiguration);

  if (mongoDbConfiguration !== undefined) {
    try {
      let transport: any = await InitMongoTransportAsync(mongoDbConfiguration);
      response.add(transport);
    } catch (error) {
      response.error("Failed to add MongoDb connection", {
        error,
        mongoDbConfiguration
      });
    }
  }

  if (telegramConnection !== undefined) {
    try {
      let transport: any = await InitTelegramTransport(telegramConnection);
      response.add(transport);
    } catch (error) {
      response.error("Failed to add Telegram connection", {
        error,
        telegramConnection
      });
    }
  }

  return response;
}
