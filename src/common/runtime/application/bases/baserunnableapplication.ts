import { Logger } from "winston";

import { IRunnableApplication } from "../interfaces/irunnableapplication";
import { BaseApplication } from "./baseapplication";

export abstract class BaseRunnableApplication extends BaseApplication implements IRunnableApplication {
  public constructor(applicationName: string, logger: Logger) {
    super(applicationName, logger);
  }

  protected abstract RunInternalAsync(): Promise<void>;

  public async RunAsync(): Promise<void> {
    this._logger.info(`Running ${this._applicationName} App`);
    await this.RunInternalAsync();
  }
}
