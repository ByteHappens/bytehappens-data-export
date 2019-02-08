import { ILog, ILogger, ILoggerFactory } from "common/logging";

import { IRunnableApplication } from "../interfaces/irunnableapplication";
import { BaseApplication } from "./baseapplication";

export abstract class BaseRunnableApplication<
  TLog extends ILog,
  TLogger extends ILogger<TLog>,
  TLoggerFactory extends ILoggerFactory<TLog, TLogger>
> extends BaseApplication<TLog, TLogger, TLoggerFactory> implements IRunnableApplication {
  public constructor(applicationName: string, loggerFactory: TLoggerFactory) {
    super(applicationName, loggerFactory);
  }

  protected abstract RunInternalAsync(): Promise<void>;

  public async RunAsync(): Promise<void> {
    await this.InitAsync();

    this._logger.Log(<TLog>{ level: "verbose", message: `Running ${this._applicationName} application` });

    await this.RunInternalAsync();
  }
}
