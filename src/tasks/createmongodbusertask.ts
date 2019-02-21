import { logging, task } from "bytehappens";

import { MongoClient, Db, DbAddUserOptions } from "mongodb";
import { mongodb } from "bytehappens-storage-mongodb";

async function AddNewUserAsync(
  mongoDbConfiguration: mongodb.IMongoDbConnection,
  mongoDbUser: mongodb.IMongoDbUser,
  newMongoDbUser: mongodb.IMongoDbUser
): Promise<boolean> {
  let client: MongoClient = await mongodb.CreateMongoDbClientAsync(mongoDbConfiguration, mongoDbUser);

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

export class CreateMongoDbLogUserTask<
  TLog extends logging.ILog,
  TLogger extends logging.ILogger<TLog>,
  TLoggerFactory extends logging.ILoggerFactory<TLog, TLogger>
> extends task.BaseTask<TLog, TLogger, TLoggerFactory> {
  private readonly _mongoDbConnection: mongodb.IMongoDbConnection;
  private readonly _mongoDbUser: mongodb.IMongoDbUser;
  private readonly _mongoDbNewUser: mongodb.IMongoDbUser;

  public constructor(
    mongoDbConnection: mongodb.IMongoDbConnection,
    mongoDbUser: mongodb.IMongoDbUser,
    newMongoDbUser: mongodb.IMongoDbUser,
    taskName: string,
    loggerFactory: TLoggerFactory
  ) {
    super(taskName, loggerFactory);

    this._mongoDbConnection = mongoDbConnection;
    this._mongoDbUser = mongoDbUser;
    this._mongoDbNewUser = newMongoDbUser;
  }

  protected async ExecuteInternalAsync(): Promise<boolean> {
    let response: boolean = false;

    try {
      response = await AddNewUserAsync(this._mongoDbConnection, this._mongoDbUser, this._mongoDbNewUser);

      this._logger.Log(<TLog>{
        level: "verbose",
        message: "Created User",
        meta: {
          connection: this._mongoDbConnection,
          user: this._mongoDbUser,
          newUser: this._mongoDbNewUser
        }
      });

      response = true;
    } catch (error) {
      if (error.name === "MongoError" && error.codeName === "DuplicateKey") {
        this._logger.Log(<TLog>{
          level: "verbose",
          message: "User already created",
          meta: {
            connection: this._mongoDbConnection,
            user: this._mongoDbUser,
            newUser: this._mongoDbNewUser
          }
        });
      } else if (error.name === "MongoNetworkError") {
        this._logger.Log(<TLog>{
          level: "error",
          message: "Failed to create user: Server unreachable",
          meta: {
            connection: this._mongoDbConnection,
            user: this._mongoDbUser,
            newUser: this._mongoDbNewUser
          }
        });
      } else {
        this._logger.Log(<TLog>{
          level: "error",
          message: "Failed to create user",
          meta: {
            connection: this._mongoDbConnection,
            user: this._mongoDbUser,
            newUser: this._mongoDbNewUser
          }
        });
      }
    }

    return response;
  }
}
