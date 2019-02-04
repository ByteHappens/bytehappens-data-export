import { Logger } from "winston";

import { IStartableApplication } from "../interfaces/istartableapplication";
import { BaseApplication } from "./baseapplication";

export abstract class BaseStartableApplication extends BaseApplication implements IStartableApplication {
  public constructor(applicationName: string, initLogger: Promise<Logger>) {
    super(applicationName, initLogger);
  }

  protected abstract StartInternalAsync(): Promise<void>;

  public async StartAsync(): Promise<void> {
    await this.InitLoggerAsync();

    if (this._logger) {
      this._logger.verbose(`Starting ${this._applicationName} App`);
    }

    await this.StartInternalAsync();
  }
}
