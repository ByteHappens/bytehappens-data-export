import { ILog, ILogger, ILoggerFactory } from "common/logging";
import { BaseRuntime } from "common/runtime";

import { IApplication } from "../interfaces/iapplication";

export abstract class BaseApplication<
  TLog extends ILog,
  TLogger extends ILogger<TLog>,
  TLoggerFactory extends ILoggerFactory<TLog, TLogger>
> extends BaseRuntime implements IApplication {
  private readonly _loggerFactory: TLoggerFactory;

  protected readonly _applicationName: string;
  protected _logger: TLogger;

  public constructor(applicationName: string, loggerFactory: TLoggerFactory) {
    super();

    this._applicationName = applicationName;
    this._loggerFactory = loggerFactory;
  }

  protected abstract StartInternalAsync(): Promise<void>;

  protected async InitialiseInternalAsync(): Promise<void> {
    await super.InitialiseInternalAsync();

    this._logger = await this._loggerFactory.CreateLoggerAsync();
  }

  protected async RunInternalAsync(): Promise<void> {
    this._logger.Log(<TLog>{ level: "verbose", message: `Starting ${this._applicationName} application` });
    await this.StartInternalAsync();
  }
}
