import { Logger } from "winston";

import { IWinstonLoggerFactory } from "common/logging/winston";

import { ITask } from "../interfaces/itask";

export abstract class BaseTask implements ITask {
  private readonly _loggerFactory: IWinstonLoggerFactory;

  protected readonly _taskName: string;
  protected _logger: Logger;

  public constructor(taskName: string, loggerFactory: IWinstonLoggerFactory) {
    this._taskName = taskName;
    this._loggerFactory = loggerFactory;
  }

  public async InitLoggerAsync(): Promise<void> {
    this._logger = await this._loggerFactory.CreateWinstonLoggerAsync();
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
