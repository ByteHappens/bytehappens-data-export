import { ValidateMongoDbConnection, ValidateMongoDbUser } from "common/storage/mongodb";

import { ValidateConfiguration } from "../validation";
import { IWinstonMongoDbConfiguration } from "./interfaces/iwinstonmongodbconfiguration";

export function ValidateMongoDbConfiguration(configuration: IWinstonMongoDbConfiguration): void {
  ValidateConfiguration(configuration);
  ValidateMongoDbConnection(configuration.connection);
  ValidateMongoDbUser(configuration.user);
}
