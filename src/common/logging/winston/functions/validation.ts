import { ValidateMongoDbConnection, ValidateMongoDbUser } from "common/storage/mongodb";

import { IWinstonConfiguration } from "../interfaces/iwinstonconfiguration";
import { IWinstonConsoleConfiguration } from "../interfaces/iwinstonconsoleconfiguration";
import { IWinstonMongoDbConfiguration } from "../interfaces/iwinstonmongodbconfiguration";
import { IWinstonTelegramConfiguration } from "../interfaces/iwinstontelegramconfiguration";

function ValidateConfiguration(configuration: IWinstonConfiguration): void {}

export function ValidateConsoleConfiguration(configuration: IWinstonConsoleConfiguration): void {
  ValidateConfiguration(configuration);
}

export function ValidateMongoDbConfiguration(configuration: IWinstonMongoDbConfiguration): void {
  ValidateConfiguration(configuration);
  ValidateMongoDbConnection(configuration.connection);
  ValidateMongoDbUser(configuration.user);
}

export function ValidateTelegramConfiguration(configuration: IWinstonTelegramConfiguration): void {
  ValidateConfiguration(configuration);
}
