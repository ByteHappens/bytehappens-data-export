import { ILog, ILogger, ILoggerFactory } from "common/logging";

import { BaseRunnableApplication } from "common/runtime/application";

import { ITask } from "../interfaces/itask";

export class TaskRunner<
  TLog extends ILog,
  TLogger extends ILogger<TLog>,
  TLoggerFactory extends ILoggerFactory<TLog, TLogger>
> extends BaseRunnableApplication<TLog, TLogger, TLoggerFactory> {
  private readonly _task: ITask;

  public constructor(task: ITask, applicationName: string, loggerFactory: TLoggerFactory) {
    super(applicationName, loggerFactory);
    this._task = task;
  }

  public async RunInternalAsync(): Promise<void> {
    await this._task.ExecuteAsync();
  }
}
