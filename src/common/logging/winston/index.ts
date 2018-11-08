import { MongoClient } from "mongodb";
import {
  Logger,
  LoggerOptions,
  format,
  transports,
  createLogger
} from "winston";
let MongoDB = require("winston-mongodb").MongoDB;

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

function InitialiseDefaultLogger(): Logger {
  let loggerOptions: LoggerOptions = {
    level: "verbose",
    format: format.json(),
    transports: [new transports.Console()]
  };

  let response: Logger = createLogger(loggerOptions);
  return response;
}

async function InitialiseMongoTransportAsync(
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

  let mongoDbTransportOptions = {
    db: client,
    collection: winstonMongoDbConnection.collection,
    level: "verbose"
  };

  let response: any = new MongoDB(mongoDbTransportOptions);
  return response;
}

export async function CreateLoggerAsync(
  winstonMongoDbConnection?: IWinstonMongoDbConnection
): Promise<Logger> {
  let response: Logger = InitialiseDefaultLogger();

  if (winstonMongoDbConnection !== undefined) {
    try {
      let transport: any = await InitialiseMongoTransportAsync(
        winstonMongoDbConnection
      );
      response.add(transport);
    } catch (error) {
      response.error(error.message, { error, winstonMongoDbConnection });
    }
  }

  return response;
}
