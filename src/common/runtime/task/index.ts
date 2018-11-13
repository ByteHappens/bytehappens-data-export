import { Logger } from "winston";

import { IApplication } from "common/runtime/application";

export interface ITask {
  ExecuteAsync(): Promise<void>;
}

export interface IRunnableApplication extends IApplication {
  RunAsync(): void;
}

export abstract class BaseTask implements ITask {
  protected readonly _taskName: string;
  protected readonly _logger: Logger;

  public constructor(taskName: string, logger: Logger) {
    this._taskName = taskName;
    this._logger = logger;
  }

  protected abstract ExecuteInternalAsync(): Promise<void>;

  public async ExecuteAsync(): Promise<void> {
    this._logger.verbose(`Executing ${this._taskName} Task`);
    await this.ExecuteInternalAsync();
  }
}

export class TaskRunnerApplication implements IRunnableApplication {
  private readonly _task: ITask;
  
  public constructor(task: ITask) {
    this._task = task;
  }

  public async RunAsync(): Promise<void> {
    await this._task.ExecuteAsync();
  }
}
