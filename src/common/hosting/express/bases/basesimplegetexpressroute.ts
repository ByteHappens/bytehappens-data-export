import { Request, Response, Router } from "express";

import { ILog, ILogger, ILoggerFactory } from "common/logging";

import { BaseExpressRoute } from "./baseexpressroute";

export abstract class BaseSimpleGetExpressRoute<
  TLog extends ILog,
  TLogger extends ILogger<TLog>,
  TLoggerFactory extends ILoggerFactory<TLog, TLogger>
> extends BaseExpressRoute<TLog, TLogger, TLoggerFactory> {
  protected abstract ProcessRequestInternal(request: Request, response: Response);

  public ProcessRequest(request: Request, response: Response): void {
    this.ProcessRequestInternal(request, response);
  }

  public GetRouter(): Router {
    this._logger.Log(<TLog>{ level: "verbose", message: `Creating Router on ${this._path}` });

    let router: Router = Router();
    router.get(this._path, (request, response) => {
      this.ProcessRequest(request, response);
    });

    return router;
  }
}
