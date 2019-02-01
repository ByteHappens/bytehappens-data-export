import { MongoClient } from "mongodb";
let MongoDB = require("winston-mongodb").MongoDB;

import { CreateMongoClientAsync } from "common/storage/mongodb";

import { IWinstonMongoDbConfiguration } from "./interfaces/iwinstonmongodbconfiguration";
import { ValidateMongoDbConfiguration } from "./validation";

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
