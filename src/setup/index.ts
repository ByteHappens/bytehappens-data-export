import { Logger } from "winston";

import { InitialiseEnvironmentAsync } from "../common/runtime/init";
import { CreateLoggerAsync, logsDatabaseName } from "../common/logging/winston";
import { CreateUserAsync } from "../common/storage/mongodb";

export async function CreateMongoDbLoggingUserAsync(
  mongoDbHost: string,
  mongoDbPort: number,
  mongoDbAdminUsername: string,
  mongoDbAdminPassword: string,
  mongoDbUsername: string,
  mongoDbPassword: string,
  logger: Logger
): Promise<void> {
  try {
    await CreateUserAsync(
      mongoDbHost,
      mongoDbPort,
      mongoDbAdminUsername,
      mongoDbAdminPassword,
      mongoDbUsername,
      mongoDbPassword,
      logsDatabaseName
    );

    logger.verbose("User created");
  } catch (err) {
    if (err.name == "MongoNetworkError") {
      logger.error("Failed to create user: Server unreachable", {
        mongoDbHost,
        mongoDbPort,
        mongoDbAdminUsername,
        mongoDbUsername
      });
    } else {
      logger.error("Failed to create user", {
        error: err,
        mongoDbHost,
        mongoDbPort,
        mongoDbAdminUsername,
        mongoDbUsername
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
      let mongoDbAdminUsername: string =
        process.env.LOGGING_MONGODB_ADMIN_USERNAME;
      let mongoDbAdminPassword: string =
        process.env.LOGGING_MONGODB_ADMIN_PASSWORD;
      let mongoDbUsername: string = process.env.LOGGING_MONGODB_USERNAME;
      let mongoDbPassword: string = process.env.LOGGING_MONGODB_PASSWORD;

      await CreateMongoDbLoggingUserAsync(
        mongoDbHost,
        mongoDbPort,
        mongoDbAdminUsername,
        mongoDbAdminPassword,
        mongoDbUsername,
        mongoDbPassword,
        logger
      );
    } catch (err) {
      logger.error("Error during setup", { error: err });
    }
  }

  logger.verbose("Exiting");
  process.exit();
}

SetupAsync();
