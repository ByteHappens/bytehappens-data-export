import { Logger } from "winston";

import { InitialiseEnvironmentAsync } from "../common/runtime/init";
import { CreateLoggerAsync, logsDatabaseName } from "../common/logging/winston";
import {
  IMongoDbConnection,
  IMongoDbUserConfiguration,
  CreateUserAsync
} from "../common/storage/mongodb";

async function CreateMongoDbLoggingUserAsync(
  mongoDbConnection: IMongoDbConnection,
  mongoDbUserConfiguration: IMongoDbUserConfiguration,
  newMongoDbUserConfiguration: IMongoDbUserConfiguration,
  logger: Logger
): Promise<void> {
  try {
    await CreateUserAsync(
      mongoDbConnection,
      mongoDbUserConfiguration,
      newMongoDbUserConfiguration
    );
    logger.verbose("User created");
  } catch (error) {
    if (error.name == "MongoNetworkError") {
      logger.error("Failed to create user: Server unreachable", {
        mongoDbConnection,
        mongoDbUserConfiguration,
        newMongoDbUserConfiguration
      });
    } else {
      logger.error("Failed to create user", {
        error: error,
        mongoDbConnection,
        mongoDbUserConfiguration,
        newMongoDbUserConfiguration
      });
    }
  }
}

async function SetupAsync(): Promise<void> {
  await InitialiseEnvironmentAsync();

  let logger: Logger = await CreateLoggerAsync();

  logger.verbose("Running setup");

  let useMongoDb: boolean = process.env.LOGGING_MONGODB_USE === "true";
  if (useMongoDb) {
    try {
      let mongoDbHost: string = process.env.LOGGING_MONGODB_HOST;
      let mongoDbPort: number = parseInt(process.env.LOGGING_MONGODB_PORT);
      let mongoDbConnection: IMongoDbConnection = {
        host: mongoDbHost,
        port: mongoDbPort
      };

      let mongoDbAdminUsername: string =
        process.env.LOGGING_MONGODB_ADMIN_USERNAME;
      let mongoDbAdminPassword: string =
        process.env.LOGGING_MONGODB_ADMIN_PASSWORD;
      let mongoDbUserConfiguration: IMongoDbUserConfiguration = {
        username: mongoDbAdminUsername,
        password: mongoDbAdminPassword
      };

      let mongoDbUsername: string = process.env.LOGGING_MONGODB_USERNAME;
      let mongoDbPassword: string = process.env.LOGGING_MONGODB_PASSWORD;
      let newMongoDbUserConfiguration: IMongoDbUserConfiguration = {
        username: mongoDbUsername,
        password: mongoDbPassword,
        databaseName: logsDatabaseName
      };

      await CreateMongoDbLoggingUserAsync(
        mongoDbConnection,
        mongoDbUserConfiguration,
        newMongoDbUserConfiguration,
        logger
      );
    } catch (error) {
      logger.error("Error during setup", { error });
    }
  }

  logger.verbose("Exiting");
  process.exit();
}

SetupAsync();
