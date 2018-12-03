import { MongoClient, MongoClientOptions, Db, DbAddUserOptions } from "mongodb";

import { IMongoDbConnection } from "../interfaces/imongodbconnection";
import { IMongoDbUser } from "../interfaces/imongodbuser";

import { ValidateMongoDbConnection, ValidateMongoDbUser } from "./validation";

function GetMongoDbUri(mongoDbConnection: IMongoDbConnection, mongoDbUser: IMongoDbUser): string {
  let response: string = `mongodb://${mongoDbUser.username}:${mongoDbUser.password}@${mongoDbConnection.host}:${mongoDbConnection.port}${
    mongoDbUser.databaseName !== undefined ? `/${mongoDbUser.databaseName}` : ""
  }`;
  return response;
}

export async function CreateMongoClientAsync(mongoDbConnection: IMongoDbConnection, mongoDbUser: IMongoDbUser): Promise<MongoClient> {
  ValidateMongoDbConnection(mongoDbConnection);
  ValidateMongoDbUser(mongoDbUser);

  let mongoDbUri: string = GetMongoDbUri(mongoDbConnection, mongoDbUser);

  let mongoClientOptions: MongoClientOptions = {
    useNewUrlParser: true
  };

  let client: MongoClient = await MongoClient.connect(
    mongoDbUri,
    mongoClientOptions
  );

  return client;
}

export async function CreateNewUserAsync(mongoDbConfiguration: IMongoDbConnection, mongoDbUser: IMongoDbUser, newMongoDbUser: IMongoDbUser): Promise<void> {
  let client: MongoClient = await CreateMongoClientAsync(mongoDbConfiguration, mongoDbUser);

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
  db.addUser(newMongoDbUser.username, newMongoDbUser.password, options);
}
