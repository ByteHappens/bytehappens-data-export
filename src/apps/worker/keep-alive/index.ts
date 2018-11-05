import { Logger } from "winston";
import * as http from "http";

import { IStartableApp } from "../../../common/app";
import { CreateLoggerAsync } from "../../../common/logging/winston";
import { BaseTask } from "../../../common/task";
import { CronApp } from "../../../common/scheduling/cron";
import { InitialiseEnvironmentAsync } from "../../../common/runtime/init";

class KeepAliveTask extends BaseTask {
  private readonly _targetHost: string;
  private readonly _targetPort: number;

  constructor(
    targetHost: string,
    targetPort: number,
    taskName: string,
    logger: Logger
  ) {
    super(taskName, logger);
    
    this._targetHost = targetHost;
    this._targetPort = targetPort;
  }

  protected ExecuteInternal(): void {
    this._logger.info(
      `Attempting to ping ${this._targetHost} on port ${this._targetPort}`
    );

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
    ? process.env.KEEPALIVE_APP_NAME
    : undefined;

  let logger: Logger = await CreateLoggerAsync(
    useMongoDb,
    mongoDbHost,
    mongoDbPort,
    mongoDbUsername,
    mongoDbPassword,
    mongoDbCollection
  );

  let appName: string = process.env.KEEPALIVE_APP_NAME;
  let targetHost: string = process.env.KEEPALIVE_TARGET_HOST;
  let targetPort: number = parseInt(process.env.KEEPALIVE_TARGET_PORT);
  let cronTime: string = process.env.KEEPALIVE_CRONTIME;

  let task = new KeepAliveTask(targetHost, targetPort, appName, logger);
  return new CronApp(task, cronTime, appName, logger);
}

GetAppAsync().then(app => app.Start());
