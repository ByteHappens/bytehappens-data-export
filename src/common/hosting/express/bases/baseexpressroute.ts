import { Logger } from "winston";
import { Router } from "express";

import { IExpressRoute } from "../interfaces/iexpressroute";

export abstract class BaseExpressRoute implements IExpressRoute {
  protected readonly _path: string;
  protected readonly _logger: Logger;

  public constructor(path: string, logger: Logger = undefined) {
    this._path = path;
    this._logger = logger;
  }

  public abstract GetRouter(): Router;
}
