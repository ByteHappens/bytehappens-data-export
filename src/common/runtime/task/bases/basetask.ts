import { Logger } from "winston";

import { ITask } from "../interfaces/itask";

export abstract class BaseTask implements ITask {
  private readonly _initLogger: Promise<Logger>;

  protected readonly _taskName: string;
  protected _logger: Logger;

  public constructor(taskName: string, initLogger: Promise<Logger>) {
    this._taskName = taskName;
    this._initLogger = initLogger;
  }

  public async InitLoggerAsync(): Promise<void> {
    this._logger = await this._initLogger;
  }

  protected abstract ExecuteInternalAsync(): Promise<boolean>;

  public async ExecuteAsync(): Promise<boolean> {
    await this.InitLoggerAsync();

    if (this._logger) {
      this._logger.verbose(`Executing ${this._taskName} Task`);
    }

    return await this.ExecuteInternalAsync();
  }
}
