import { IWinstonLoggerFactory } from "common/logging/winston";
import { BaseRunnableApplication } from "common/runtime/application";

import { ITask } from "../interfaces/itask";

export class TaskRunner extends BaseRunnableApplication {
  private readonly _task: ITask;

  public constructor(task: ITask, applicationName: string, loggerFactory: IWinstonLoggerFactory) {
    super(applicationName, loggerFactory);
    this._task = task;
  }

  public async RunInternalAsync(): Promise<void> {
    await this._task.ExecuteAsync();
  }
}
