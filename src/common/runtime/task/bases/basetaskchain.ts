import { Logger } from "winston";

import { ITask } from "../interfaces/itask";
import { ITaskChain } from "../interfaces/itaskchain";

import { BaseTask } from "./basetask";

export abstract class BaseTaskChain extends BaseTask implements ITaskChain {
  private _onSuccess: ITask;
  private _onFailure: ITask;

  public constructor(onSuccess: ITask, onFailure: ITask, taskName: string, logger: Logger) {
    super(taskName, logger);

    this._onSuccess = onSuccess;
    this._onFailure = onFailure;
  }

  protected abstract ExecuteInternalAsync(): Promise<boolean>;

  public async ExecuteAsync(): Promise<boolean> {
    this._logger.verbose(`Executing ${this._taskName} Task`);

    let taskResponse: boolean = await this.ExecuteInternalAsync();

    return taskResponse ? await this._onSuccess.ExecuteAsync() : await this._onFailure.ExecuteAsync();
  }
}
