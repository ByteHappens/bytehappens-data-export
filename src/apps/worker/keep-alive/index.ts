import { Logger } from "winston";
import * as http from "http";

import { IStartableApp } from "../../../common/app";
import { CronApp, ICronTask } from "../../../common/scheduling/cron";
import { InitialiseEnvironmentAsync } from "../../../common/runtime/init";
import { CreateLoggerAsync } from "../../../common/logging/winston";

class KeepAliveTask implements ICronTask {
  private _targetHost: string;
  private _targetPort: number;
  private _logger: Logger;

  constructor(targetHost: string, targetPort: number, logger: Logger) {
    this._targetHost = targetHost;
    this._targetPort = targetPort;
    this._logger = logger;
  }

  public Execute(): void {
    this._logger.verbose("Executing KeepAlive task");

    try {
      http.get(<http.RequestOptions>{
        host: this._targetHost,
        port: this._targetPort
      });
    } catch (err) {
      this._logger.error("Failed to contact target", { error: err });
    }
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

  let cronTime: string = process.env.KEEPALIVE_CRONTIME;
  let targetHost: string = process.env.KEEPALIVE_TARGET_HOST;
  let targetPort: number = parseInt(process.env.KEEPALIVE_TARGET_PORT);

  let task = new KeepAliveTask(targetHost, targetPort, logger);
  return new CronApp(task, cronTime, logger);
}

GetAppAsync().then(app => app.Start());
