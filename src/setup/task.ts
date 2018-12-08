import { Logger } from "winston";

import { BaseTask } from "common/runtime/task";
import { IMongoDbConnection, IMongoDbUser, CreateNewUserAsync } from "common/storage/mongodb";

export class Task extends BaseTask {
  private readonly _mongoDbConnection: IMongoDbConnection;
  private readonly _mongoDbUser: IMongoDbUser;
  private readonly _newMongoDbUser: IMongoDbUser;

  public constructor(mongoDbConnection: IMongoDbConnection, mongoDbUser: IMongoDbUser, newMongoDbUser: IMongoDbUser, taskName: string, logger: Logger) {
    super(taskName, logger);

    this._mongoDbConnection = mongoDbConnection;
    this._mongoDbUser = mongoDbUser;
    this._newMongoDbUser = newMongoDbUser;
  }

  protected async ExecuteInternalAsync(): Promise<void> {
    try {
      await CreateNewUserAsync(this._mongoDbConnection, this._mongoDbUser, this._newMongoDbUser);
      this._logger.verbose("User created");
    } catch (error) {
      if (error.name == "MongoNetworkError") {
        this._logger.error("Failed to create user: Server unreachable", {
          mongoDbConnection: this._mongoDbConnection,
          mongoDbUser: this._mongoDbUser,
          newMongoDbUser: this._newMongoDbUser
        });
      } else {
        this._logger.error("Failed to create user", {
          error: error,
          mongoDbConnection: this._mongoDbConnection,
          mongoDbUser: this._mongoDbUser,
          newMongoDbUser: this._newMongoDbUser
        });
      }
    }

    this._logger.verbose("Exiting");
    process.exit();
  }
}
