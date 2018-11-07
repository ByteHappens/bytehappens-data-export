import { Logger } from "winston";

import { IStartableApp } from "../../../common/app";
import { CreateLoggerAsync } from "../../../common/logging/winston";
import { ExpressApp } from "../../../common/hosting/express";
import { InitialiseEnvironmentAsync } from "../../../common/runtime/init";

class PingListenerApp extends ExpressApp {
  constructor(host: string, port: number, appName: string, logger: Logger) {
    super(host, port, appName, logger);
  }

  protected ProcessRequest(request, response): void {
    this._logger.verbose("Ping received");

    response.status(204);
    response.send();
  }
}

async function GetAppAsync(): Promise<IStartableApp> {
  await InitialiseEnvironmentAsync();

  let useMongoDb: boolean = process.env.LOGGING_MONGODB_USE === "true";
  let mongoDbHost: string = useMongoDb ? process.env.MONGODB_HOST : undefined;
  let mongoDbPort: number = useMongoDb
    ? parseInt(process.env.LOGGING_MONGODB_PORT)
    : undefined;
  let mongoDbUsername: string = useMongoDb
    ? process.env.LOGGING_MONGODB_USERNAME
    : undefined;
  let mongoDbPassword: string = useMongoDb
    ? process.env.LOGGING_MONGODB_PASSWORD
    : undefined;
  let mongoDbCollection: string = useMongoDb
    ? process.env.PINGLISTENER_APP_NAME
    : undefined;

  let logger: Logger = await CreateLoggerAsync(
    useMongoDb,
    mongoDbHost,
    mongoDbPort,
    mongoDbUsername,
    mongoDbPassword,
    mongoDbCollection
  );

  let appName: string = process.env.PINGLISTENER_APP_NAME;
  let host: string = process.env.PINGLISTENER_HOST;
  let port: number = parseInt(process.env.PINGLISTENER_PORT);

  return new PingListenerApp(host, port, appName, logger);
}

GetAppAsync().then(app => app.Start());
