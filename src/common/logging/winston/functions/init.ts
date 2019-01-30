import { Logger, LoggerOptions, createLogger, format, transports } from "winston";
let MongoDB = require("winston-mongodb").MongoDB;
let Telegram = require("winston-telegram");

import { MongoClient } from "mongodb";

import { CreateMongoClientAsync } from "common/storage/mongodb";

import { IWinstonConsoleConfiguration } from "../interfaces/iwinstonconsoleconfiguration";
import { IWinstonMongoDbConfiguration } from "../interfaces/iwinstonmongodbconfiguration";
import { IWinstonTelegramConfiguration } from "../interfaces/iwinstontelegramconfiguration";

import { ValidateConsoleConfiguration, ValidateMongoDbConfiguration, ValidateTelegramConfiguration } from "./validation";

export function InitDefaultLogger(configuration: IWinstonConsoleConfiguration): Logger {
  ValidateConsoleConfiguration(configuration);

  let loggerOptions: LoggerOptions = {
    level: configuration.level,
    format: format.json(),
    transports: [new transports.Console()]
  };

  let response: Logger = createLogger(loggerOptions);
  return response;
}

export async function InitMongoTransportAsync(configuration: IWinstonMongoDbConfiguration): Promise<any> {
  ValidateMongoDbConfiguration(configuration);

  let client: MongoClient = await CreateMongoClientAsync(configuration.connection, configuration.user);

  let transportOptions = {
    level: configuration.level,
    db: client,
    collection: configuration.collection
  };

  let response: any = new MongoDB(transportOptions);
  return response;
}

export function InitTelegramTransport(configuration: IWinstonTelegramConfiguration) {
  ValidateTelegramConfiguration(configuration);

  let transportOptions = {
    level: configuration.level,
    token: configuration.token,
    chatId: configuration.chatId,
    disableNotification: configuration.disableNotification
  };

  let response: any = new Telegram(transportOptions);
  return response;
}
