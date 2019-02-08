import { ILog, ILogger, ILoggerFactory } from "common/logging";
import { IStartableApplication } from "common/runtime/application";

import { BaseTask } from "../bases/basetask";

export class StartApplication<
  TLog extends ILog,
  TLogger extends ILogger<TLog>,
  TLoggerFactory extends ILoggerFactory<TLog, TLogger>
> extends BaseTask<TLog, TLogger, TLoggerFactory> {
  private _application: IStartableApplication;

  public constructor(application: IStartableApplication, taskName: string, loggerFactory: TLoggerFactory) {
    super(taskName, loggerFactory);

    this._application = application;
  }

  protected async ExecuteInternalAsync(): Promise<boolean> {
    await this._application.StartAsync();

    return true;
  }
}
