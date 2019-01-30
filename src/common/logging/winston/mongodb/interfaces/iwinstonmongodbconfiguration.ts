import { IMongoDbConnection, IMongoDbUser } from "common/storage/mongodb";

import { IWinstonConfiguration } from "../../interfaces/iwinstonconfiguration";

export interface IWinstonMongoDbConfiguration extends IWinstonConfiguration {
  connection: IMongoDbConnection;
  user: IMongoDbUser;
  collection: string;
}
