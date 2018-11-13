import { Logger } from "winston";

export interface IApplication {}

export interface IStartableApplication extends IApplication {
  Start(): void;
}

export abstract class BaseApplication {
  protected readonly _applicationName: string;
  protected readonly _logger: Logger;

  public constructor(applicationName: string, logger: Logger) {
    this._applicationName = applicationName;
    this._logger = logger;
  }
}

export abstract class BaseStartableApplication extends BaseApplication implements IStartableApplication {
  public constructor(applicationName: string, logger: Logger) {
    super(applicationName, logger);
  }

  protected abstract StartInternal(): void;

  public Start(): void {
    this._logger.info(`Starting ${this._applicationName} App`);
    this.StartInternal();
  }
}
