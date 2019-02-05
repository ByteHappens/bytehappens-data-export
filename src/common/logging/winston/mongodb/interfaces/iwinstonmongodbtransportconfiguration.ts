import { IMongoDbConnection, IMongoDbUser } from "common/storage/mongodb";

import { IWinstonTransportConfiguration } from "../../interfaces/iwinstontransportconfiguration";

export interface IWinstonMongoDbTransportConfiguration extends IWinstonTransportConfiguration {
  connection: IMongoDbConnection;
  user: IMongoDbUser;
  collection: string;
}
