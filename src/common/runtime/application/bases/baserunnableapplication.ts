import { Logger } from "winston";

import { IRunnableApplication } from "../interfaces/irunnableapplication";
import { BaseApplication } from "./baseapplication";

export abstract class BaseRunnableApplication extends BaseApplication implements IRunnableApplication {
  public constructor(applicationName: string, initLogger: Promise<Logger>) {
    super(applicationName, initLogger);
  }

  protected abstract RunInternalAsync(): Promise<void>;

  public async RunAsync(): Promise<void> {
    await this.InitLoggerAsync();

    if (this._logger) {
      this._logger.verbose(`Running ${this._applicationName} App`);
    }

    await this.RunInternalAsync();
  }
}
