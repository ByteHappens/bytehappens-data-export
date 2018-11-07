import { Logger } from "winston";

export interface ITask {
  Execute(): void;
}

export abstract class BaseTask implements ITask {
  protected readonly _taskName: string;
  protected readonly _logger: Logger;

  public constructor(taskName: string, logger: Logger) {
    this._taskName = taskName;
    this._logger = logger;
  }

  protected abstract ExecuteInternal(): void;

  public Execute(): void {
    this._logger.info(`Executing ${this._taskName} Task`);
    this.ExecuteInternal();
  }
}
