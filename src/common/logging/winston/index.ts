import { MongoClient } from "mongodb";
import { Logger, LoggerOptions, format, transports, createLogger } from "winston";
let MongoDB = require("winston-mongodb").MongoDB;

import { GetMongoClientAsync } from "../../storage/mongodb";

export const logsDatabaseName: string = "logs";

function InitialiseDefaultLogger(): Logger {
  let loggerOptions: LoggerOptions = {
    level: "verbose",
    format: format.json(),
    transports: [new transports.Console()]
  };

  let response: Logger = createLogger(loggerOptions);
  return response;
}

async function InitialiseMongoTransportAsync(
  logger: Logger,
  mongoDbHost: string,
  mongoDbPort: number,
  mongoDbUsername: string,
  mongoDbPassword: string,
  mongoDbCollection: string
): Promise<void> {
  if (
    mongoDbHost !== undefined &&
    mongoDbPort !== undefined &&
    mongoDbUsername !== undefined &&
    mongoDbPassword !== undefined &&
    mongoDbCollection !== undefined
  ) {
    try {
      let client: MongoClient = await GetMongoClientAsync(mongoDbHost, mongoDbPort, mongoDbUsername, mongoDbPassword, logsDatabaseName);

      let mongoDbTransportOptions = {
        db: client,
        collection: mongoDbCollection,
        level: "verbose"
      };

      let transport: any = new MongoDB(mongoDbTransportOptions);
      logger.add(transport);
    } catch (err) {
      logger.error("Failed to add MongoDb transport to Winston", {
        error: err,
        mongoDbHost,
        mongoDbPort,
        mongoDbUsername,
        mongoDbCollection
      });
    }
  } else {
    logger.error("Failed to add MongoDb transport to Winston: Missing configuration(s)", {
      mongoDbHost,
      mongoDbPort,
      mongoDbUsername,
      mongoDbCollection
    });
  }
}

export async function CreateLoggerAsync(
  useMongoDb?: boolean,
  mongoDbHost?: string,
  mongoDbPort?: number,
  mongoDbUsername?: string,
  mongoDbPassword?: string,
  mongoDbCollection?: string
): Promise<Logger> {
  let response: Logger = InitialiseDefaultLogger();

  if (useMongoDb) {
    await InitialiseMongoTransportAsync(response, mongoDbHost, mongoDbPort, mongoDbUsername, mongoDbPassword, mongoDbCollection);
  }

  return response;
}
