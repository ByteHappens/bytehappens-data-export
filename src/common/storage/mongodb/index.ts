import { MongoClient, MongoClientOptions, Db, DbAddUserOptions } from "mongodb";

function GetMongoDbUri(host: string, port: number, username: string, password: string, databaseName?: string): string {
  let response: string = `mongodb://${username}:${password}@${host}:${port}${databaseName !== undefined ? `/${databaseName}` : ""}`;
  return response;
}

export async function GetMongoClientAsync(
  host: string,
  port: number,
  username: string,
  password: string,
  databaseName?: string
): Promise<MongoClient> {
  let mongoDbUri: string = GetMongoDbUri(host, port, username, password, databaseName);

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
  host: string,
  port: number,
  adminUsername,
  adminPassword,
  username: string,
  password: string,
  database: string
): Promise<void> {
  let client: MongoClient = await GetMongoClientAsync(host, port, adminUsername, adminPassword);

  let db: Db = client.db(database);

  let options: DbAddUserOptions = {
    roles: [
      {
        role: "readWrite",
        db: database
      }
    ]
  };

  db.addUser(username, password, options);
}
