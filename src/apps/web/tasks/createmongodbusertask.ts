import { IWinstonLoggerFactory } from "common/logging/winston";
import { BaseTaskChain, Start, Exit } from "common/runtime/task";
import { IMongoDbConnection, IMongoDbUser, AddNewUserAsync } from "common/storage/mongodb";

export class CreateMongoDbLogUserTask extends BaseTaskChain<Start, Exit> {
  private readonly _mongoDbConnection: IMongoDbConnection;
  private readonly _mongoDbUser: IMongoDbUser;
  private readonly _mongoDbNewUser: IMongoDbUser;

  public constructor(
    mongoDbConnection: IMongoDbConnection,
    mongoDbUser: IMongoDbUser,
    newMongoDbUser: IMongoDbUser,
    onSuccess: Start,
    taskName: string,
    loggerFactory: IWinstonLoggerFactory
  ) {
    super(onSuccess, new Exit(`Exit${taskName}`, loggerFactory), taskName, loggerFactory);

    this._mongoDbConnection = mongoDbConnection;
    this._mongoDbUser = mongoDbUser;
    this._mongoDbNewUser = newMongoDbUser;
  }

  protected async ExecuteInternalAsync(): Promise<boolean> {
    let response: boolean = false;

    try {
      response = await AddNewUserAsync(this._mongoDbConnection, this._mongoDbUser, this._mongoDbNewUser);

      if (this._logger) {
        this._logger.log("verbose", "Created User", {
          connection: this._mongoDbConnection,
          user: this._mongoDbUser,
          newUser: this._mongoDbNewUser
        });
      }
    } catch (error) {
      if (error.name === "MongoError" && error.codeName === "DuplicateKey") {
        if (this._logger) {
          this._logger.log("verbose", "User already created", {
            connection: this._mongoDbConnection,
            user: this._mongoDbUser,
            newUser: this._mongoDbNewUser
          });
        }
      } else if (error.name === "MongoNetworkError") {
        if (this._logger) {
          this._logger.log("error", "Failed to create user: Server unreachable", {
            connection: this._mongoDbConnection,
            user: this._mongoDbUser,
            newUser: this._mongoDbNewUser
          });
        }
      } else {
        if (this._logger) {
          this._logger.log("error", "Failed to create user", {
            error: error,
            connection: this._mongoDbConnection,
            user: this._mongoDbUser,
            newUser: this._mongoDbNewUser
          });
        }
      }

      //  EBU: Even if this fails, try and start the server
      response = true;
    }

    return response;
  }
}
