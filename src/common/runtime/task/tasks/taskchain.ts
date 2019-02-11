import { ILog, ILogger, ILoggerFactory } from "common/logging";

import { ITask } from "../interfaces/itask";
import { BaseTask } from "../bases/basetask";

export class TaskChain<
  TLog extends ILog,
  TLogger extends ILogger<TLog>,
  TLoggerFactory extends ILoggerFactory<TLog, TLogger>,
  TExecute extends ITask,
  TSuccess extends ITask,
  TFailure extends ITask
> extends BaseTask<TLog, TLogger, TLoggerFactory> {
  private _onExecute: TExecute;
  private _onSuccess: TSuccess;
  private _onFailure: TFailure;

  public constructor(
    onExecute: TExecute,
    onSuccess: TSuccess,
    onFailure: TFailure,
    taskName: string,
    loggerFactory: TLoggerFactory
  ) {
    super(taskName, loggerFactory);

    this._onExecute = onExecute;
    this._onSuccess = onSuccess;
    this._onFailure = onFailure;
  }

  public async ExecuteInternalAsync(): Promise<boolean> {
    let taskResponse: boolean = false;

    try {
      await this._onExecute.RunAsync();
      taskResponse = await this._onExecute.GetResultAsync();
    } catch (error) {
      this._logger.Log(<TLog>{ level: "error", message: "Unexpected error when running task", meta: { error } });
    }

    let response: boolean;
    if (taskResponse) {
      this._logger.Log(<TLog>{ level: "verbose", message: `Running OnSuccess after ${this._taskName}` });

      await this._onFailure.RunAsync();
      response = await this._onSuccess.GetResultAsync();
    } else {
      this._logger.Log(<TLog>{ level: "verbose", message: `Running OnFailure after ${this._taskName}` });

      await this._onFailure.RunAsync();
      response = await this._onFailure.GetResultAsync();
    }

    return response;
  }
}
