import { Logger } from "winston";
import * as express from "express";

import { IStartableApp } from "../../../common/app";
import { InitialiseEnvironmentAsync } from "../../../common/runtime/init";
import { CreateLoggerAsync } from "../../../common/logging/winston";

class PingListenerApp implements IStartableApp {
  private _port: number;
  private _app: express.Application;
  private _logger: Logger;

  constructor(port: number, logger: Logger) {
    this._port = port;
    this._logger = logger;

    this._app = express();
    this._app.get("/", (request, response) => this.ProcessRequest(request, response));
  }

  public Start(): void {
    this._logger.info("Starting PingListener app");
    this._app.listen(this._port);
  }

  private ProcessRequest(request, response): void {
    this._logger.verbose("Ping received");

    response.status(204);
    response.send();
  }
}

async function GetAppAsync(): Promise<IStartableApp> {
  await InitialiseEnvironmentAsync();

  let useMongoDb: boolean = process.env.LOGGING_USEMONGODB === "true";
  let mongoDbHost: string = process.env.MONGODB_HOST;
  let mongoDbPort: number = parseInt(process.env.MONGODB_PORT);
  let mongoDbUsername: string = process.env.MONGODB_LOGS_USERNAME;
  let mongoDbPassword: string = process.env.MONGODB_LOGS_PASSWORD;
  let mongoDbCollection: string = process.env.PINGLISTENER_APP_NAME;

  let logger: Logger = await CreateLoggerAsync(useMongoDb, mongoDbHost, mongoDbPort, mongoDbUsername, mongoDbPassword, mongoDbCollection);

  let port: number = parseInt(process.env.PINGLISTENER_PORT);

  return new PingListenerApp(port, logger);
}

GetAppAsync().then(app => app.Start());
