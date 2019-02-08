import { ILog, ILogger, ILoggerFactory } from "common/logging";

import { ITask } from "../interfaces/itask";

export abstract class BaseTask<
  TLog extends ILog,
  TLogger extends ILogger<TLog>,
  TLoggerFactory extends ILoggerFactory<TLog, TLogger>
> implements ITask {
  private readonly _loggerFactory: TLoggerFactory;
  private _init: Promise<void>;

  protected readonly _taskName: string;
  protected _logger: TLogger;

  public constructor(taskName: string, loggerFactory: TLoggerFactory) {
    this._taskName = taskName;
    this._loggerFactory = loggerFactory;
  }

  protected abstract ExecuteInternalAsync(): Promise<boolean>;

  private async InitInternalAsync(): Promise<void> {
    this._logger = await this._loggerFactory.GetLoggerAsync();
  }

  public async InitAsync(): Promise<void> {
    if (!this._init) {
      this._init = this.InitInternalAsync();
    }

    return this._init;
  }

  public async ExecuteAsync(): Promise<boolean> {
    await this.InitAsync();

    this._logger.Log(<TLog>{ level: "verbose", message: `Executing ${this._taskName} task` });

    return await this.ExecuteInternalAsync();
  }
}
