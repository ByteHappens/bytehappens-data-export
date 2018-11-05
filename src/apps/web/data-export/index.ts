import { Logger } from "winston";

import { IStartableApp } from "../../../common/app";
import { CreateLoggerAsync } from "../../../common/logging/winston";
import { ExpressApp } from "../../../common/hosting/express";
import { InitialiseEnvironmentAsync } from "../../../common/runtime/init";

class DataExportApp extends ExpressApp {
  constructor(port: number, appName: string, logger: Logger) {
    super(port, appName, logger);
  }

  protected ProcessRequest(request, response): void {
    this._logger.verbose("Sending reply");

    response.status(200);
    response.send("I'm alive !");
  }
}

async function GetAppAsync(): Promise<IStartableApp> {
  await InitialiseEnvironmentAsync();

  let useMongoDb: boolean = process.env.LOGGING_USEMONGODB === "true";
  let mongoDbHost: string = useMongoDb ? process.env.MONGODB_HOST : undefined;
  let mongoDbPort: number = useMongoDb
    ? parseInt(process.env.MONGODB_PORT)
    : undefined;
  let mongoDbUsername: string = useMongoDb
    ? process.env.MONGODB_LOGS_USERNAME
    : undefined;
  let mongoDbPassword: string = useMongoDb
    ? process.env.MONGODB_LOGS_PASSWORD
    : undefined;
  let mongoDbCollection: string = useMongoDb
    ? process.env.DATAEXPORT_APP_NAME
    : undefined;

  let logger: Logger = await CreateLoggerAsync(
    useMongoDb,
    mongoDbHost,
    mongoDbPort,
    mongoDbUsername,
    mongoDbPassword,
    mongoDbCollection
  );

  let appName: string = process.env.DATAEXPORT_APP_NAME;
  let port: number = parseInt(process.env.DATAEXPORT_PORT);

  return new DataExportApp(port, appName, logger);
}

GetAppAsync().then(app => app.Start());
