import { MongoClient } from "mongodb";
import {
  Logger,
  LoggerOptions,
  format,
  transports,
  createLogger
} from "winston";
let MongoDB = require("winston-mongodb").MongoDB;
let Telegram = require("winston-telegram").Telegram;

import {
  IMongoDbConnection,
  IMongoDbUserConfiguration,
  ValidateMongoDbConnection,
  ValidateMongoDbUserConfiguration,
  GetMongoClientAsync
} from "../../storage/mongodb";

export const logsDatabaseName: string = "logs";

export interface IWinstonMongoDbConnection {
  mongoDbConnection: IMongoDbConnection;
  mongoDbUserConfiguration: IMongoDbUserConfiguration;
  collection: string;
}

export interface IWinstonTelegramConnection {
  botToken: string;
  chatId: number;
}

function InitDefaultLogger(): Logger {
  let loggerOptions: LoggerOptions = {
    level: "verbose",
    format: format.json(),
    transports: [new transports.Console()]
  };

  let response: Logger = createLogger(loggerOptions);
  return response;
}

async function InitMongoTransportAsync(
  winstonMongoDbConnection: IWinstonMongoDbConnection
): Promise<void> {
  ValidateMongoDbConnection(winstonMongoDbConnection.mongoDbConnection);
  ValidateMongoDbUserConfiguration(
    winstonMongoDbConnection.mongoDbUserConfiguration
  );

  let client: MongoClient = await GetMongoClientAsync(
    winstonMongoDbConnection.mongoDbConnection,
    winstonMongoDbConnection.mongoDbUserConfiguration
  );

  let transportOptions = {
    db: client,
    collection: winstonMongoDbConnection.collection,
    level: "verbose"
  };

  let response: any = new MongoDB(transportOptions);
  return response;
}

function InitTelegramTransport(
  winstonTelegramConnection: IWinstonTelegramConnection
) {
  let transportOptions = {
    token: winstonTelegramConnection.botToken,
    chatId: winstonTelegramConnection.chatId,
    level: "info"
  };

  let response: any = new Telegram(transportOptions);
  return response;
}

export async function CreateLoggerAsync(
  winstonMongoDbConnection?: IWinstonMongoDbConnection,
  winstonTelegramConnection?: IWinstonTelegramConnection
): Promise<Logger> {
  let response: Logger = InitDefaultLogger();

  if (winstonMongoDbConnection !== undefined) {
    try {
      let transport: any = await InitMongoTransportAsync(
        winstonMongoDbConnection
      );
      response.add(transport);
    } catch (error) {
      response.error("Failed to add MongoDb connection", {
        error,
        winstonMongoDbConnection
      });
    }
  }

  if (winstonTelegramConnection !== undefined) {
    try {
      let transport: any = await InitTelegramTransport(
        winstonTelegramConnection
      );
      response.add(transport);
    } catch (error) {
      response.error("Failed to add Telegram connection", {
        error,
        winstonTelegramConnection
      });
    }
  }

  return response;
}
