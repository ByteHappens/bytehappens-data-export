import { ILog, ILogger, ILoggerFactory } from "common/logging";

export abstract class BaseApplication<
  TLog extends ILog,
  TLogger extends ILogger<TLog>,
  TLoggerFactory extends ILoggerFactory<TLog, TLogger>
> {
  private readonly _loggerFactory: TLoggerFactory;
  private _init: Promise<void>;

  protected readonly _applicationName: string;
  protected _logger: TLogger;

  public constructor(applicationName: string, loggerFactory: TLoggerFactory) {
    this._applicationName = applicationName;
    this._loggerFactory = loggerFactory;
  }

  private async InitInternalAsync(): Promise<void> {
    this._logger = await this._loggerFactory.GetLoggerAsync();
  }

  public async InitAsync(): Promise<void> {
    if (!this._init) {
      this._init = this.InitInternalAsync();
    }
    
    return this._init;
  }
}
