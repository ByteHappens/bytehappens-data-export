import { Logger } from "winston";

import { IWinstonConsoleConfiguration } from "./console/interfaces/iwinstonconsoleconfiguration";
import { IWinstonMongoDbConfiguration } from "./mongodb/interfaces/iwinstonmongodbconfiguration";
import { IWinstonTelegramConfiguration } from "./telegram/interfaces/iwinstontelegramconfiguration";

import { InitConsoleLogger } from "./console/init";
import { InitMongoTransportAsync } from "./mongodb/init";
import { InitTelegramTransport } from "./telegram/init";

export async function CreateLoggerAsync(
  consoleConfiguration: IWinstonConsoleConfiguration,
  mongoDbConfiguration?: IWinstonMongoDbConfiguration,
  telegramConnection?: IWinstonTelegramConfiguration
): Promise<Logger> {
  let response: Logger = InitConsoleLogger(consoleConfiguration);

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
