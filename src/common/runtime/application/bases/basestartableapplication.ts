import { ILog, ILogger, ILoggerFactory } from "common/logging";

import { IStartableApplication } from "../interfaces/istartableapplication";
import { BaseApplication } from "./baseapplication";

export abstract class BaseStartableApplication<
  TLog extends ILog,
  TLogger extends ILogger<TLog>,
  TLoggerFactory extends ILoggerFactory<TLog, TLogger>
> extends BaseApplication<TLog, TLogger, TLoggerFactory> implements IStartableApplication {
  public constructor(applicationName: string, loggerFactory: TLoggerFactory) {
    super(applicationName, loggerFactory);
  }

  protected abstract StartInternalAsync(): Promise<void>;

  public async StartAsync(): Promise<void> {
    await this.InitAsync();

    this._logger.Log(<TLog>{ level: "verbose", message: `Starting ${this._applicationName} application` });

    await this.StartInternalAsync();
  }
}
