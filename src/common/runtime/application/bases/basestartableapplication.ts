import { IWinstonLoggerFactory } from "common/logging/winston";
import { IStartableApplication } from "../interfaces/istartableapplication";
import { BaseApplication } from "./baseapplication";

export abstract class BaseStartableApplication extends BaseApplication implements IStartableApplication {
  public constructor(applicationName: string, loggerFactory: IWinstonLoggerFactory) {
    super(applicationName, loggerFactory);
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
