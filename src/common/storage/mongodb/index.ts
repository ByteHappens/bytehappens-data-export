import { MongoClient, MongoClientOptions, Db, DbAddUserOptions } from "mongodb";

export interface IMongoDbConnection {
  host: string;
  port: number;
}

export interface IMongoDbUserConfiguration {
  username: string;
  password: string;
  databaseName?: string;
}

export function ValidateMongoDbConnection(mongoDbConfiguration: IMongoDbConnection): void {
  if (mongoDbConfiguration.host === undefined || mongoDbConfiguration.port === undefined) {
    throw new Error("Invalid MongoDb connection detected");
  }
}

export function ValidateMongoDbUserConfiguration(mongoDbUserConfiguration: IMongoDbUserConfiguration): void {
  if (mongoDbUserConfiguration.username === undefined || mongoDbUserConfiguration.password === undefined) {
    throw new Error("Invalid MongoDb User configuration detected");
  }
}

function GetMongoDbUri(mongoDbConfiguration: IMongoDbConnection, mongoDbUserConfiguration: IMongoDbUserConfiguration): string {
  let response: string = `mongodb://${mongoDbUserConfiguration.username}:${mongoDbUserConfiguration.password}@${mongoDbConfiguration.host}:${
    mongoDbConfiguration.port
  }${mongoDbUserConfiguration.databaseName !== undefined ? `/${mongoDbUserConfiguration.databaseName}` : ""}`;
  return response;
}

export async function GetMongoClientAsync(mongoDbConfiguration: IMongoDbConnection, mongoDbUserConfiguration: IMongoDbUserConfiguration): Promise<MongoClient> {
  let mongoDbUri: string = GetMongoDbUri(mongoDbConfiguration, mongoDbUserConfiguration);

  let mongoClientOptions: MongoClientOptions = {
    useNewUrlParser: true
  };

  let client: MongoClient = await MongoClient.connect(
    mongoDbUri,
    mongoClientOptions
  );

  return client;
}

export async function CreateUserAsync(
  mongoDbConfiguration: IMongoDbConnection,
  mongoDbUserConfiguration: IMongoDbUserConfiguration,
  newMongoDbUserConfiguration: IMongoDbUserConfiguration
): Promise<void> {
  let client: MongoClient = await GetMongoClientAsync(mongoDbConfiguration, mongoDbUserConfiguration);

  let databaseName: string = newMongoDbUserConfiguration.databaseName;

  let options: DbAddUserOptions = {
    roles: [
      {
        role: "readWrite",
        db: newMongoDbUserConfiguration.databaseName
      }
    ]
  };

  let db: Db = client.db(databaseName);
  db.addUser(newMongoDbUserConfiguration.username, newMongoDbUserConfiguration.password, options);
}
