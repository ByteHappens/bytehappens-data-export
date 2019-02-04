import { Logger } from "winston";

export abstract class BaseApplication {
  private readonly _initLogger: Promise<Logger>;

  protected readonly _applicationName: string;
  protected _logger: Logger;

  public constructor(applicationName: string, initLogger: Promise<Logger>) {
    this._applicationName = applicationName;
    this._initLogger = initLogger;
  }

  public async InitLoggerAsync(): Promise<void> {
    this._logger = await this._initLogger;
  }
}
