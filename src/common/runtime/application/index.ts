import { Logger } from "winston";

export interface IApplication {}

export interface IStartableApplication extends IApplication {
  Start(): void;
}

export abstract class BaseApplication implements IStartableApplication {
  protected readonly _applicationName: string;
  protected readonly _logger: Logger;

  public constructor(applicationName: string, logger: Logger) {
    this._applicationName = applicationName;
    this._logger = logger;
  }

  protected abstract StartInternal(): void;

  public Start(): void {
    this._logger.info(`Starting ${this._applicationName} App`);
    this.StartInternal();
  }
}
