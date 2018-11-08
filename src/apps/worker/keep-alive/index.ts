import { Logger } from "winston";
import * as http from "http";

import { IStartableApp } from "../../../common/app";
import {
  IWinstonMongoDbConnection,
  CreateLoggerAsync,
  logsDatabaseName
} from "../../../common/logging/winston";
import { BaseTask } from "../../../common/task";
import { CronApp } from "../../../common/scheduling/cron";
import { InitialiseEnvironmentAsync } from "../../../common/runtime/init";

class KeepAliveTask extends BaseTask {
  private readonly _targetHost: string;
  private readonly _targetPath: string;
  private readonly _targetPort: number;

  public constructor(
    targetHost: string,
    targetPath: string,
    targetPort: number,
    taskName: string,
    logger: Logger
  ) {
    super(taskName, logger);

    this._targetHost = targetHost;
    this._targetPath = targetPath;
    this._targetPort = targetPort;
  }

  protected ExecuteInternal(): void {
    this._logger.verbose(
      `Attempting to ping ${this._targetHost} at ${this._targetPath} on port ${
        this._targetPort
      }`
    );

    try {
      http.get(
        <http.RequestOptions>{
          host: this._targetHost,
          path: this._targetPath,
          port: this._targetPort
        },
        (response: http.IncomingMessage) => {
          this._logger.verbose(`Result status code: ${response.statusCode}`);
        }
      );
    } catch (error) {
      this._logger.error("Failed to contact target", { error });
    }
  }
}

async function GetAppAsync(): Promise<IStartableApp> {
  await InitialiseEnvironmentAsync();

  let winstonMongoDbConnection: IWinstonMongoDbConnection = undefined;

  let useMongoDb: boolean = process.env.LOGGING_MONGODB_USE === "true";
  if (useMongoDb) {
    let host: string = process.env.MONGODB_HOST;
    let port: number = parseInt(process.env.LOGGING_MONGODB_PORT);
    let username: string = process.env.LOGGING_MONGODB_USERNAME;
    let password: string = process.env.LOGGING_MONGODB_PASSWORD;
    let collection: string = process.env.KEEPALIVE_APP_NAME;

    winstonMongoDbConnection = {
      mongoDbConnection: {
        host: host,
        port: port
      },
      mongoDbUserConfiguration: {
        username: username,
        password: password,
        databaseName: logsDatabaseName
      },
      collection: collection
    };
  }

  let logger: Logger = await CreateLoggerAsync(winstonMongoDbConnection);

  let appName: string = process.env.KEEPALIVE_APP_NAME;
  let targetHost: string = process.env.KEEPALIVE_TARGET_HOST;
  let targetPath: string = process.env.KEEPALIVE_TARGET_PATH;
  let targetPort: number = parseInt(process.env.KEEPALIVE_TARGET_PORT || "80");
  let cronTime: string = process.env.KEEPALIVE_CRONTIME;

  let task = new KeepAliveTask(
    targetHost,
    targetPath,
    targetPort,
    appName,
    logger
  );
  return new CronApp(task, cronTime, appName, logger);
}

GetAppAsync().then(app => app.Start());
