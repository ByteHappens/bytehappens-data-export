require("module-alias/register");

import { Logger } from "winston";

import { BaseInititaliser } from "common/runtime/init";
import { IRunnableApplication } from "common/runtime/application";
import { ITask, BaseTask, TaskRunnerApplication } from "common/runtime/task";
import { IWinstonConsoleConfiguration, CreateLoggerAsync } from "common/logging/winston";
import { IMongoDbConnection, IMongoDbUser, CreateNewUserAsync } from "common/storage/mongodb";

class Task extends BaseTask {
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

class Initialiser extends BaseInititaliser<IRunnableApplication> {
  protected async InitialiseInternalAsync(): Promise<IRunnableApplication> {
    let consoleLevel: string = process.env.LOGGING_CONSOLE_LEVEL;

    let consoleConfiguration: IWinstonConsoleConfiguration = {
      level: consoleLevel
    };

    let logger: Logger = await CreateLoggerAsync(consoleConfiguration);

    let application: IRunnableApplication = undefined;

    let useMongoDb: boolean = process.env.LOGGING_MONGODB_USE === "true";
    if (useMongoDb) {
      try {
        let host: string = process.env.LOGGING_MONGODB_HOST;
        let port: number = parseInt(process.env.LOGGING_MONGODB_PORT);
        let connection: IMongoDbConnection = {
          host: host,
          port: port
        };

        let username: string = process.env.LOGGING_MONGODB_ADMIN_USERNAME;
        let password: string = process.env.LOGGING_MONGODB_ADMIN_PASSWORD;
        let user: IMongoDbUser = {
          username: username,
          password: password
        };

        let newUsername: string = process.env.LOGGING_MONGODB_USERNAME;
        let newPassword: string = process.env.LOGGING_MONGODB_PASSWORD;

        let databaseName: string = process.env.LOGGING_MONGODB_DATABASE;

        let newUser: IMongoDbUser = {
          username: newUsername,
          password: newPassword,
          databaseName: databaseName
        };

        let task: ITask = new Task(connection, user, newUser, "Setup", logger);
        application = new TaskRunnerApplication(task, "Setup", logger);
      } catch (error) {
        logger.error("Error during setup", { error });
      }

      return application;
    }
  }
}

let initialiser: Initialiser = new Initialiser();
initialiser.InitialiseAsync().then(async (application: IRunnableApplication) => {
  if (application != undefined) {
    await application.RunAsync();
  }
});
