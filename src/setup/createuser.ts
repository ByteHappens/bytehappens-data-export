import { Logger } from "winston";

import { BaseTask } from "common/runtime/task";
import { IMongoDbConnection, IMongoDbUser, CreateNewUserAsync } from "common/storage/mongodb";

export class CreateUser extends BaseTask {
  private readonly _mongoDbConnection: IMongoDbConnection;
  private readonly _mongoDbUser: IMongoDbUser;
  private readonly _mongoDbNewUser: IMongoDbUser;

  public constructor(mongoDbConnection: IMongoDbConnection, mongoDbUser: IMongoDbUser, newMongoDbUser: IMongoDbUser, taskName: string, logger: Logger) {
    super(taskName, logger);

    this._mongoDbConnection = mongoDbConnection;
    this._mongoDbUser = mongoDbUser;
    this._mongoDbNewUser = newMongoDbUser;
  }

  protected async ExecuteInternalAsync(): Promise<boolean> {
    try {
      await CreateNewUserAsync(this._mongoDbConnection, this._mongoDbUser, this._mongoDbNewUser);
      this._logger.verbose("User created", {connection: this._mongoDbConnection, user: this._mongoDbUser, newUser: this._mongoDbNewUser});
    } catch (error) {
      if (error.name == "MongoNetworkError") {
        this._logger.error("Failed to create user: Server unreachable", {
          connection: this._mongoDbConnection,
          user: this._mongoDbUser,
          newUser: this._mongoDbNewUser
        });
      } else {
        this._logger.error("Failed to create user", {
          error: error,
          connection: this._mongoDbConnection,
          user: this._mongoDbUser,
          newUser: this._mongoDbNewUser
        });
      }
    }

    this._logger.verbose("Exiting");
    process.exit();
    return true;
  }
}
