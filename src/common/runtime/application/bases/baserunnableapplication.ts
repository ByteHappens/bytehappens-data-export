import { IWinstonLoggerFactory } from "common/logging/winston";
import { IRunnableApplication } from "../interfaces/irunnableapplication";
import { BaseApplication } from "./baseapplication";

export abstract class BaseRunnableApplication extends BaseApplication implements IRunnableApplication {
  public constructor(applicationName: string, loggerFactory: IWinstonLoggerFactory) {
    super(applicationName, loggerFactory);
  }

  protected abstract RunInternalAsync(): Promise<void>;

  public async RunAsync(): Promise<void> {
    await this.InitLoggerAsync();

    if (this._logger) {
      this._logger.log("verbose", `Running ${this._applicationName} application`);
    }

    await this.RunInternalAsync();
  }
}
