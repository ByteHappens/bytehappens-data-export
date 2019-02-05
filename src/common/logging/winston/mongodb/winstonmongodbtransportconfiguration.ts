import { MongoClient } from "mongodb";
let MongoDB = require("winston-mongodb").MongoDB;

import { WinstonTransportConfiguration } from "common/logging/winston";
import {
  IMongoDbConnection,
  IMongoDbUser,
  ValidateMongoDbConnection,
  ValidateMongoDbUser,
  CreateMongoDbClientAsync
} from "common/storage/mongodb";

import { IWinstonMongoDbTransportConfiguration } from "./interfaces/iwinstonmongodbtransportconfiguration";

export class WinstonMongoDbTransportConfiguration extends WinstonTransportConfiguration
  implements IWinstonMongoDbTransportConfiguration {
  public readonly connection: IMongoDbConnection;
  public readonly user: IMongoDbUser;
  public readonly collection: string;

  constructor(connection: IMongoDbConnection, user: IMongoDbUser, collection: string, level: string) {
    super(level);

    this.connection = connection;
    this.user = user;
    this.collection = collection;
  }

  public Validate(): void {
    super.Validate();

    ValidateMongoDbConnection(this.connection);
    ValidateMongoDbUser(this.user);
  }

  public async InitTransportAsync(): Promise<any> {
    let client: MongoClient = await CreateMongoDbClientAsync(this.connection, this.user);

    let transportOptions = {
      level: this.level,
      db: client,
      collection: this.collection
    };

    let response: any = new MongoDB(transportOptions);
    return response;
  }
}
