require('module-alias/register')

import { Logger } from "winston";
import * as http from "http";

import { InitialiseEnvironmentAsync } from "common/runtime/init";
import { IStartableApplication } from "common/runtime/application";
import { BaseTask } from "common/runtime/task";
import { IWinstonMongoDbConnection, IWinstonTelegramConnection, CreateLoggerAsync, logsDatabaseName } from "common/logging/winston";
import { CronApplication } from "common/scheduling/cron";

class KeepAliveTask extends BaseTask {
  private readonly _targetHost: string;
  private readonly _targetPath: string;
  private readonly _targetPort: number;

  public constructor(targetHost: string, targetPath: string, targetPort: number, taskName: string, logger: Logger) {
    super(taskName, logger);

    this._targetHost = targetHost;
    this._targetPath = targetPath;
    this._targetPort = targetPort;
  }

  protected ExecuteInternal(): void {
    this._logger.verbose(`Attempting to ping ${this._targetHost} at ${this._targetPath} on port ${this._targetPort}`);

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

async function GetAppAsync(): Promise<IStartableApplication> {
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

  let winstonTelegramConnection: IWinstonTelegramConnection = undefined;

  let useTelegram: boolean = process.env.LOGGING_TELEGRAM_USE === "true";
  if (useTelegram) {
    let botToken: string = process.env.LOGGING_TELEGRAM_BOT_TOKEN;
    let chatId: number = parseInt(process.env.LOGGING_TELEGRAM_CHAT_ID);

    winstonTelegramConnection = {
      botToken: botToken,
      chatId: chatId
    };
  }

  let logger: Logger = await CreateLoggerAsync(winstonMongoDbConnection, winstonTelegramConnection);

  let applicationName: string = process.env.KEEPALIVE_APP_NAME;
  let targetHost: string = process.env.KEEPALIVE_TARGET_HOST;
  let targetPath: string = process.env.KEEPALIVE_TARGET_PATH;
  let targetPort: number = parseInt(process.env.KEEPALIVE_TARGET_PORT || "80");
  let cronTime: string = process.env.KEEPALIVE_CRONTIME;

  let task = new KeepAliveTask(targetHost, targetPath, targetPort, applicationName, logger);
  return new CronApplication(task, cronTime, applicationName, logger);
}

GetAppAsync().then(app => app.Start());
