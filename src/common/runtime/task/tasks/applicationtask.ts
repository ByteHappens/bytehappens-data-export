import { ILog, ILogger, ILoggerFactory } from "common/logging";
import { IApplication } from "common/runtime/application";

import { BaseTask } from "../bases/basetask";

export class ApplicationTask<
  TLog extends ILog,
  TLogger extends ILogger<TLog>,
  TLoggerFactory extends ILoggerFactory<TLog, TLogger>
> extends BaseTask<TLog, TLogger, TLoggerFactory> {
  private _application: IApplication;

  public constructor(application: IApplication, taskName: string, loggerFactory: TLoggerFactory) {
    super(taskName, loggerFactory);

    this._application = application;
  }

  protected async ExecuteInternalAsync(): Promise<boolean> {
    await this._application.RunAsync();
    return true;
  }
}
