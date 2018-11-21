require("module-alias/register");

import { Logger } from "winston";
import * as http from "http";

import { BaseInititaliser } from "common/runtime/init";
import { IStartableApplication } from "common/runtime/application";
import { BaseTask } from "common/runtime/task";
import { IWinstonConsoleConfiguration, IWinstonMongoDbConfiguration, IWinstonTelegramConfiguration, CreateLoggerAsync } from "common/logging/winston";
import { CronApplication } from "common/scheduling/cron";

class Task extends BaseTask {
  private readonly _targetHost: string;
  private readonly _targetPath: string;
  private readonly _targetPort: number;

  public constructor(targetHost: string, targetPath: string, targetPort: number, taskName: string, logger: Logger) {
    super(taskName, logger);

    this._targetHost = targetHost;
    this._targetPath = targetPath;
    this._targetPort = targetPort;
  }

  protected async ExecuteInternalAsync(): Promise<void> {
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

class Initialiser extends BaseInititaliser<IStartableApplication> {
  protected async InitialiseInternalAsync(): Promise<IStartableApplication> {
    let consoleLevel: string = process.env.LOGGING_CONSOLE_LEVEL;

    let consoleConfiguration: IWinstonConsoleConfiguration = {
      level: consoleLevel
    };

    let mongoDbConfiguration: IWinstonMongoDbConfiguration = undefined;

    let useMongoDb: boolean = process.env.LOGGING_MONGODB_USE === "true";
    if (useMongoDb) {
      let mongoDbLevel: string = process.env.LOGGING_MONGODB_LEVEL;

      let host: string = process.env.MONGODB_HOST;
      let port: number = parseInt(process.env.LOGGING_MONGODB_PORT);
      let username: string = process.env.LOGGING_MONGODB_USERNAME;
      let password: string = process.env.LOGGING_MONGODB_PASSWORD;
      let databaseName: string = process.env.LOGGING_MONGODB_DATABASE;
      let collection: string = process.env.PINGLISTENER_APP_NAME;

      mongoDbConfiguration = {
        level: mongoDbLevel,
        connection: {
          host: host,
          port: port
        },
        user: {
          username: username,
          password: password,
          databaseName: databaseName
        },
        collection: collection
      };
    }

    let telegramConfiguration: IWinstonTelegramConfiguration = undefined;

    let useTelegram: boolean = process.env.LOGGING_TELEGRAM_USE === "true";
    if (useTelegram) {
      let telegramLevel: string = process.env.LOGGING_TELEGRAM_LEVEL;

      let botToken: string = process.env.LOGGING_TELEGRAM_BOT_TOKEN;
      let chatId: number = parseInt(process.env.LOGGING_TELEGRAM_CHAT_ID);
      let silent: boolean = process.env.LOGGING_TELEGRAM_SILENT === "true";

      telegramConfiguration = {
        level: telegramLevel,
        botToken: botToken,
        chatId: chatId,
        silent: silent
      };
    }

    let logger: Logger = await CreateLoggerAsync(consoleConfiguration, mongoDbConfiguration, telegramConfiguration);

    let applicationName: string = process.env.KEEPALIVE_APP_NAME;
    let targetHost: string = process.env.KEEPALIVE_TARGET_HOST;
    let targetPath: string = process.env.KEEPALIVE_TARGET_PATH;
    let targetPort: number = parseInt(process.env.KEEPALIVE_TARGET_PORT || "80");
    let cronTime: string = process.env.KEEPALIVE_CRONTIME;

    let task = new Task(targetHost, targetPath, targetPort, applicationName, logger);
    return new CronApplication(task, cronTime, applicationName, logger);
  }
}

let initialiser: Initialiser = new Initialiser();
initialiser.InitialiseAsync().then((application: IStartableApplication) => application.Start());
