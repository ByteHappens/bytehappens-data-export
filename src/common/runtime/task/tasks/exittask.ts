import { ILog, ILogger, ILoggerFactory } from "common/logging";

import { BaseTask } from "../bases/basetask";

export class ExitTask<
  TLog extends ILog,
  TLogger extends ILogger<TLog>,
  TLoggerFactory extends ILoggerFactory<TLog, TLogger>
> extends BaseTask<TLog, TLogger, TLoggerFactory> {
  public constructor(taskName: string, loggerFactory: TLoggerFactory) {
    super(taskName, loggerFactory);
  }

  protected async ExecuteInternalAsync(): Promise<boolean> {
    this._logger.Log(<TLog>{ level: "verbose", message: "Exiting" });

    process.exit();

    //  EBU: Might not be reached
    return true;
  }
}
