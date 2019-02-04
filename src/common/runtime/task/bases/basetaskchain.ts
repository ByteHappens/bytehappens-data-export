import { Logger } from "winston";

import { ITask } from "../interfaces/itask";
import { ITaskChain } from "../interfaces/itaskchain";

import { BaseTask } from "./basetask";

export abstract class BaseTaskChain<TSuccess extends ITask, TFailure extends ITask> extends BaseTask implements ITaskChain {
  private _onSuccess: TSuccess;
  private _onFailure: TFailure;

  public constructor(onSuccess: TSuccess, onFailure: TFailure, taskName: string, initLogger: Promise<Logger>) {
    super(taskName, initLogger);

    this._onSuccess = onSuccess;
    this._onFailure = onFailure;
  }

  protected abstract ExecuteInternalAsync(): Promise<boolean>;

  public async ExecuteAsync(): Promise<boolean> {
    let taskResponse: boolean = await super.ExecuteAsync();

    return taskResponse ? await this._onSuccess.ExecuteAsync() : await this._onFailure.ExecuteAsync();
  }
}
