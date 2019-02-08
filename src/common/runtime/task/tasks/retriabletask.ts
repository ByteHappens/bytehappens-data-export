import { ILog, ILogger, ILoggerFactory } from "common/logging";

import { ITask } from "../interfaces/itask";
import { BaseTask } from "../bases/basetask";

export class RetriableTask<
  TLog extends ILog,
  TLogger extends ILogger<TLog>,
  TLoggerFactory extends ILoggerFactory<TLog, TLogger>,
  TExecute extends ITask
> extends BaseTask<TLog, TLogger, TLoggerFactory> {
  private _onExecute: TExecute;
  private _attempts: number;
  private _delayInMs: number;

  public constructor(
    onExecute: TExecute,
    attempts: number,
    delayInMs: number,
    taskName: string,
    loggerFactory: TLoggerFactory
  ) {
    super(taskName, loggerFactory);

    this._onExecute = onExecute;
    this._attempts = attempts;
    this._delayInMs = delayInMs;
  }

  public async ExecuteInternalAsync(): Promise<boolean> {
    let response: boolean = false;

    let currentAttempts: number = 0;
    let shouldRetry: boolean = false;
    do {
      try {
        response = await this._onExecute.ExecuteAsync();
      } catch (error) {
        this._logger.Log(<TLog>{ level: "error", message: "Unexpected error when running task", meta: { error } });
      }

      currentAttempts++;
      shouldRetry = !response && currentAttempts < this._attempts;

      if (shouldRetry) {
        this._logger.Log(<TLog>{
          level: "error",
          message: "Retrying task after delay",
          meta: {
            currentAttempts,
            maxAttempts: this._attempts,
            delayInMs: this._delayInMs
          }
        });

        await new Promise((resolve, reject) => {
          setTimeout(async function() {
            resolve();
          }, this._delayInMs);
        });
      }
    } while (shouldRetry);

    return response;
  }
}
