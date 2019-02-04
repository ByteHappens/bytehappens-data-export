import { Logger } from "winston";

import { BaseInititaliser } from "common/runtime/init";
import { ITask, TaskRunner } from "common/runtime/task";
import { IWinstonConsoleConfiguration, CreateLoggerAsync } from "common/logging/winston";
import { IMongoDbConnection, IMongoDbUser } from "common/storage/mongodb";

import { CreateUser } from "./createuser";

export class Initialiser extends BaseInititaliser<CreateUser> {
  protected async InitialiseInternalAsync(): Promise<CreateUser> {
    let consoleLevel: string = process.env.LOGGING_CONSOLE_LEVEL;

    let consoleConfiguration: IWinstonConsoleConfiguration = {
      level: consoleLevel
    };

    let logger: Logger = await CreateLoggerAsync(consoleConfiguration);

    let task: CreateUser = undefined;

    let useMongoDb: boolean = process.env.LOGGING_MONGODB_USE === "true";
    if (useMongoDb) {
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

      task = new CreateUser(connection, user, newUser, "CreateUser", logger);
      return task;
    }
  }
}
