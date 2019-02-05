import { IWinstonLoggerFactory } from "common/logging/winston";
import { IStartableApplication } from "common/runtime/application";

import { BaseTask } from "../bases/basetask";

export class Start extends BaseTask {
  private _application: IStartableApplication;

  public constructor(application: IStartableApplication, taskName: string, loggerFactory: IWinstonLoggerFactory) {
    super(taskName, loggerFactory);

    this._application = application;
  }

  protected async ExecuteInternalAsync(): Promise<boolean> {
    await this._application.StartAsync();

    return true;
  }
}
