import { Logger } from "winston";
import { Router } from "express";

import { IExpressRoute } from "../interfaces/iexpressroute";

export abstract class BaseExpressRoute implements IExpressRoute {
  private readonly _initLogger: Promise<Logger>;

  protected readonly _path: string;
  protected _logger: Logger;

  public constructor(path: string, initLogger: Promise<Logger>) {
    this._path = path;
    this._initLogger = initLogger;
  }

  public async InitLoggerAsync(): Promise<void> {
    this._logger = await this._initLogger;
  }

  public abstract GetRouter(): Router;
}
