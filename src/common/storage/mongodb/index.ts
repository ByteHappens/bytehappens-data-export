import { MongoClient, MongoClientOptions, Db, DbAddUserOptions } from "mongodb";

export interface IMongoDbConnection {
  host: string;
  port: number;
}

export interface IMongoDbUser {
  username: string;
  password: string;
  databaseName?: string;
}

export function ValidateMongoDbConnection(mongoDbConfiguration: IMongoDbConnection): void {
  if (mongoDbConfiguration.host === undefined || mongoDbConfiguration.port === undefined) {
    throw new Error("Invalid MongoDb connection detected");
  }
}

export function ValidateMongoDbUser(mongoDbUser: IMongoDbUser): void {
  if (mongoDbUser.username === undefined || mongoDbUser.password === undefined) {
    throw new Error("Invalid MongoDb User detected");
  }
}

function GetMongoDbUri(mongoDbConfiguration: IMongoDbConnection, mongoDbUser: IMongoDbUser): string {
  let response: string = `mongodb://${mongoDbUser.username}:${mongoDbUser.password}@${mongoDbConfiguration.host}:${mongoDbConfiguration.port}${
    mongoDbUser.databaseName !== undefined ? `/${mongoDbUser.databaseName}` : ""
  }`;
  return response;
}

export async function GetMongoClientAsync(mongoDbConfiguration: IMongoDbConnection, mongoDbUser: IMongoDbUser): Promise<MongoClient> {
  let mongoDbUri: string = GetMongoDbUri(mongoDbConfiguration, mongoDbUser);

  let mongoClientOptions: MongoClientOptions = {
    useNewUrlParser: true
  };

  let client: MongoClient = await MongoClient.connect(
    mongoDbUri,
    mongoClientOptions
  );

  return client;
}

export async function CreateUserAsync(mongoDbConfiguration: IMongoDbConnection, mongoDbUser: IMongoDbUser, newMongoDbUser: IMongoDbUser): Promise<void> {
  let client: MongoClient = await GetMongoClientAsync(mongoDbConfiguration, mongoDbUser);

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
