import { MongoClient } from "mongodb";
import { Logger, LoggerOptions, format, transports, createLogger } from "winston";
let MongoDB = require("winston-mongodb").MongoDB;
let Telegram = require("winston-telegram").Telegram;

import { IMongoDbConnection, IMongoDbUser, ValidateMongoDbConnection, ValidateMongoDbUser, GetMongoClientAsync } from "common/storage/mongodb";

export interface IWinstonConfiguration {
  level: string;
}

export interface IWinstonConsoleConfiguration extends IWinstonConfiguration {}

export interface IWinstonMongoDbConfiguration extends IWinstonConfiguration {
  connection: IMongoDbConnection;
  user: IMongoDbUser;
  collection: string;
}

export interface IWinstonTelegramConfiguration extends IWinstonConfiguration {
  botToken: string;
  chatId: number;
  disableNotification: boolean;
}

function ValidateConfiguration(configuration: IWinstonConfiguration): void {}

function ValidateConsoleConfiguration(configuration: IWinstonConsoleConfiguration): void {
  ValidateConfiguration(configuration);
}

function ValidateMongoDbConfiguration(configuration: IWinstonMongoDbConfiguration): void {
  ValidateConfiguration(configuration);
  ValidateMongoDbConnection(configuration.connection);
  ValidateMongoDbUser(configuration.user);
}

function ValidateTelegramConfiguration(configuration: IWinstonTelegramConfiguration): void {
  ValidateConfiguration(configuration);
}

function InitDefaultLogger(configuration: IWinstonConsoleConfiguration): Logger {
  ValidateConsoleConfiguration(configuration);

  let loggerOptions: LoggerOptions = {
    level: configuration.level,
    format: format.json(),
    transports: [new transports.Console()]
  };

  let response: Logger = createLogger(loggerOptions);
  return response;
}

async function InitMongoTransportAsync(configuration: IWinstonMongoDbConfiguration): Promise<void> {
  ValidateMongoDbConfiguration(configuration);

  let client: MongoClient = await GetMongoClientAsync(configuration.connection, configuration.user);

  let transportOptions = {
    level: configuration.level,
    db: client,
    collection: configuration.collection
  };

  let response: any = new MongoDB(transportOptions);
  return response;
}

function InitTelegramTransport(configuration: IWinstonTelegramConfiguration) {
  ValidateTelegramConfiguration(configuration);

  let transportOptions = {
    level: configuration.level,
    token: configuration.botToken,
    chatId: configuration.chatId,
    disableNotification: configuration.disableNotification
  };

  let response: any = new Telegram(transportOptions);
  return response;
}

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
