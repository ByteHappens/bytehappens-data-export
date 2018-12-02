import { Logger } from "winston";

export abstract class BaseApplication {
  protected readonly _applicationName: string;
  protected readonly _logger: Logger;

  public constructor(applicationName: string, logger: Logger) {
    this._applicationName = applicationName;
    this._logger = logger;
  }
}
