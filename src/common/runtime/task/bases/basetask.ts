import { ILog, ILogger, ILoggerFactory } from "common/logging";
import { BaseRuntime } from "common/runtime";

import { ITask } from "../interfaces/itask";

export abstract class BaseTask<
  TLog extends ILog,
  TLogger extends ILogger<TLog>,
  TLoggerFactory extends ILoggerFactory<TLog, TLogger>
> extends BaseRuntime implements ITask {
  private readonly _loggerFactory: TLoggerFactory;

  protected readonly _taskName: string;
  protected _logger: TLogger;
  protected _result: Promise<boolean>;

  public constructor(taskName: string, loggerFactory: TLoggerFactory) {
    super();

    this._taskName = taskName;
    this._loggerFactory = loggerFactory;
  }

  protected abstract ExecuteInternalAsync(): Promise<boolean>;

  protected async InitialiseInternalAsync(): Promise<void> {
    await super.InitialiseInternalAsync();

    this._logger = await this._loggerFactory.GetLoggerAsync();
  }

  protected async RunInternalAsync(): Promise<void> {
    this._logger.Log(<TLog>{ level: "verbose", message: `Executing ${this._taskName} task` });
    this._result = this.ExecuteInternalAsync();
  }

  public async GetResultAsync(): Promise<boolean> {
    return this._result;
  }
}
