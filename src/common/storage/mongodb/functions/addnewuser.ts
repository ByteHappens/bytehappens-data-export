import { MongoClient, MongoClientOptions, Db, DbAddUserOptions } from "mongodb";

import { IMongoDbConnection } from "../interfaces/imongodbconnection";
import { IMongoDbUser } from "../interfaces/imongodbuser";
import { CreateMongoDbClientAsync } from "./createmongodbclient";

export async function AddNewUserAsync(
  mongoDbConfiguration: IMongoDbConnection,
  mongoDbUser: IMongoDbUser,
  newMongoDbUser: IMongoDbUser
): Promise<boolean> {
  let client: MongoClient = await CreateMongoDbClientAsync(mongoDbConfiguration, mongoDbUser);

  let databaseName: string = newMongoDbUser.databaseName;
  let options: DbAddUserOptions = {
    roles: [
      {
        role: "readWrite",
        db: newMongoDbUser.databaseName
      }
    ]
  };

  let db: Db = client.db(databaseName);
  await db.addUser(newMongoDbUser.username, newMongoDbUser.password, options);

  return true;
}
