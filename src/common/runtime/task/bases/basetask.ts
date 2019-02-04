import { Logger } from "winston";

import { ITask } from "../interfaces/itask";

export abstract class BaseTask implements ITask {
  protected readonly _taskName: string;
  protected readonly _logger: Logger;

  public constructor(taskName: string, logger: Logger) {
    this._taskName = taskName;
    this._logger = logger;
  }

  protected abstract ExecuteInternalAsync(): Promise<boolean>;

  public async ExecuteAsync(): Promise<boolean> {
    this._logger.verbose(`Executing ${this._taskName} Task`);
    return await this.ExecuteInternalAsync();
  }
}
