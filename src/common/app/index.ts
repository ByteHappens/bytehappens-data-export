import { Logger } from "winston";

export interface IStartableApp {
  Start(): void;
}

export abstract class BaseApp implements IStartableApp {
  protected readonly _appName: string;
  protected readonly _logger: Logger;

  constructor(appName: string, logger: Logger) {
    this._appName = appName;
    this._logger = logger;
  }

  protected abstract StartInternal(): void;

  public Start(): void {
    this._logger.info(`Starting ${this._appName} App`);
    this.StartInternal();
  }
}
