import { Logger } from "winston";

import { IWinstonLoggerFactory } from "common/logging/winston";

export abstract class BaseApplication {
  private readonly _loggerFactory: IWinstonLoggerFactory;

  protected readonly _applicationName: string;
  protected _logger: Logger;

  public constructor(applicationName: string, loggerFactory: IWinstonLoggerFactory) {
    this._applicationName = applicationName;
    this._loggerFactory = loggerFactory;
  }

  public async InitLoggerAsync(): Promise<void> {
    this._logger = await this._loggerFactory.CreateWinstonLoggerAsync();
  }
}
