import { IWinstonLoggerFactory } from "common/logging/winston";
import { ITask } from "../interfaces/itask";

import { BaseTask } from "../bases/basetask";

export class TaskChain<TExecute extends ITask, TSuccess extends ITask, TFailure extends ITask> extends BaseTask {
  private _onExecute: TExecute;
  private _onSuccess: TSuccess;
  private _onFailure: TFailure;

  public constructor(
    onExecute: TExecute,
    onSuccess: TSuccess,
    onFailure: TFailure,
    taskName: string,
    loggerFactory: IWinstonLoggerFactory
  ) {
    super(taskName, loggerFactory);

    this._onExecute = onExecute;
    this._onSuccess = onSuccess;
    this._onFailure = onFailure;
  }

  public async ExecuteInternalAsync(): Promise<boolean> {
    let taskResponse: boolean = false;

    try {
      taskResponse = await this._onExecute.ExecuteAsync();
    } catch (error) {
      if (this._logger) {
        this._logger.log("error", `Failed to execute ${this._taskName}`, { error });
      }
    }

    let response: boolean;
    if (taskResponse) {
      if (this._logger) {
        this._logger.log("verbose", `Running OnSuccess after ${this._taskName}`);
      }

      response = await this._onSuccess.ExecuteAsync();
    } else {
      if (this._logger) {
        this._logger.log("verbose", `Running OnFailure after ${this._taskName}`);
      }

      response = await this._onFailure.ExecuteAsync();
    }

    return response;
  }
}
