import { Router } from "express";
import { logging } from "bytehappens";

import { IExpressRoute } from "../interfaces/iexpressroute";

export abstract class BaseExpressRoute<
  TLog extends logging.ILog,
  TLogger extends logging.ILogger<TLog>,
  TLoggerFactory extends logging.ILoggerFactory<TLog, TLogger>
> implements IExpressRoute {
  private readonly _loggerFactory: TLoggerFactory;
  private _init: Promise<void>;

  protected readonly _path: string;
  protected _logger: TLogger;

  public constructor(path: string, loggerFactory: TLoggerFactory) {
    this._path = path;
    this._loggerFactory = loggerFactory;
  }

  public abstract GetRouter(): Router;

  private async InitInternalAsync(): Promise<void> {
    this._logger = await this._loggerFactory.CreateLoggerAsync();
  }

  public async InitAsync(): Promise<void> {
    if (!this._init) {
      this._init = this.InitInternalAsync();
    }

    return this._init;
  }
}
