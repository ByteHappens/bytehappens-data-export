import { IWinstonLoggerFactory } from "common/logging/winston";
import { ITask } from "../interfaces/itask";

import { BaseTask } from "../bases/basetask";

export class RetriableTask<TExecute extends ITask> extends BaseTask {
  private _onExecute: TExecute;
  private _attempts: number;
  private _delayInMs: number;

  public constructor(
    onExecute: TExecute,
    attempts: number,
    delayInMs: number,
    taskName: string,
    loggerFactory: IWinstonLoggerFactory
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
        if (this._logger) {
          this._logger.log("error", "Unexpected error when running task", { error });
        }
      }

      currentAttempts++;
      shouldRetry = !response && currentAttempts < this._attempts;

      if (shouldRetry) {
        if (this._logger) {
          this._logger.log("error", "Retrying task after delay", {
            currentAttempts,
            maxAttempts: this._attempts,
            delayInMs: this._delayInMs
          });
        }

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
