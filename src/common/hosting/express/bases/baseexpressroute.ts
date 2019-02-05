import { Logger } from "winston";
import { Router } from "express";

import { IExpressRoute } from "../interfaces/iexpressroute";

export abstract class BaseExpressRoute implements IExpressRoute {
  protected readonly _path: string;
  protected _logger: Logger;

  public constructor(path: string) {
    this._path = path;
  }

  public AttachLogger(logger: Logger): void {
    this._logger = logger;
  }

  public abstract GetRouter(): Router;
}
