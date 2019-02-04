import { Logger } from "winston";

import { IStartableApplication } from "../interfaces/istartableapplication";
import { BaseApplication } from "./baseapplication";

export abstract class BaseStartableApplication extends BaseApplication implements IStartableApplication {
  public constructor(applicationName: string, logger: Logger = undefined) {
    super(applicationName, logger);
  }

  protected abstract StartInternal(): void;

  public Start(): void {
    if (this._logger) {
      this._logger.verbose(`Starting ${this._applicationName} App`);
    }

    this.StartInternal();
  }
}
