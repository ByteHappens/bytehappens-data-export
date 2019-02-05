import { IWinstonLoggerFactory } from "common/logging/winston";
import { ITask } from "../interfaces/itask";
import { ITaskChain } from "../interfaces/itaskchain";

import { BaseTask } from "./basetask";

export abstract class BaseTaskChain<TSuccess extends ITask, TFailure extends ITask> extends BaseTask implements ITaskChain {
  private _onSuccess: TSuccess;
  private _onFailure: TFailure;

  public constructor(onSuccess: TSuccess, onFailure: TFailure, taskName: string, loggerFactory: IWinstonLoggerFactory) {
    super(taskName, loggerFactory);

    this._onSuccess = onSuccess;
    this._onFailure = onFailure;
  }

  public async ExecuteAsync(): Promise<boolean> {
    let taskResponse: boolean = false;

    try {
      taskResponse = await super.ExecuteAsync();
    } catch (error) {
      if (this._logger) {
        this._logger.error(`Error executing ${this._taskName}, running OnFailure`, { error });
      }
    }

    let response: boolean;
    if (taskResponse) {
      if (this._logger) {
        this._logger.verbose(`Running OnSuccess after ${this._taskName}`);
      }

      response = await this._onSuccess.ExecuteAsync();
    } else {
      if (this._logger) {
        this._logger.verbose(`Running OnFailure after ${this._taskName}`);
      }

      response = await this._onFailure.ExecuteAsync();
    }

    return response;
  }
}
