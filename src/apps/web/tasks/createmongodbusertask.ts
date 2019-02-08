import { ILog, ILogger, ILoggerFactory } from "common/logging";

import { IMongoDbConnection, IMongoDbUser, AddNewUserAsync } from "common/storage/mongodb";
import { BaseTask } from "common/runtime/task";

export class CreateMongoDbLogUserTask<
  TLog extends ILog,
  TLogger extends ILogger<TLog>,
  TLoggerFactory extends ILoggerFactory<TLog, TLogger>
> extends BaseTask<TLog, TLogger, TLoggerFactory> {
  private readonly _mongoDbConnection: IMongoDbConnection;
  private readonly _mongoDbUser: IMongoDbUser;
  private readonly _mongoDbNewUser: IMongoDbUser;

  public constructor(
    mongoDbConnection: IMongoDbConnection,
    mongoDbUser: IMongoDbUser,
    newMongoDbUser: IMongoDbUser,
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
