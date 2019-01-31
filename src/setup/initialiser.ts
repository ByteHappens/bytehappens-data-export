import { Logger } from "winston";

import { BaseInititaliser } from "common/runtime/init";
import { IRunnableApplication } from "common/runtime/application";
import { ITask, TaskRunnerApplication } from "common/runtime/task";
import { IWinstonConsoleConfiguration, CreateLoggerAsync } from "common/logging/winston";
import { IMongoDbConnection, IMongoDbUser } from "common/storage/mongodb";

import { Task } from "./task";

export class Initialiser extends BaseInititaliser<IRunnableApplication> {
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
