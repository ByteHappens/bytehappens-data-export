import { Logger } from "winston";

import { IStartableApplication } from "common/runtime/application";

import { BaseTask } from "../bases/basetask";

export class Start extends BaseTask {
  private _application: IStartableApplication;

  public constructor(application: IStartableApplication, taskName: string, logger: Logger = undefined) {
    super(taskName, logger);

    this._application = application;
  }

  protected async ExecuteInternalAsync(): Promise<boolean> {
    this._application.Start();

    return true;
  }
}
