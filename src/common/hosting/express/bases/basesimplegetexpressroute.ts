import { Request, Response, Router } from "express";
import { logging } from "bytehappens";

import { BaseExpressRoute } from "./baseexpressroute";

export abstract class BaseSimpleGetExpressRoute<
  TLog extends logging.ILog,
  TLogger extends logging.ILogger<TLog>,
  TLoggerFactory extends logging.ILoggerFactory<TLog, TLogger>
> extends BaseExpressRoute<TLog, TLogger, TLoggerFactory> {
  protected abstract ProcessRequestInternal(request: Request, response: Response);

  public ProcessRequest(request: Request, response: Response): void {
    this.ProcessRequestInternal(request, response);
  }

  public GetRouter(): Router {
    let router: Router = Router();

    this._logger.Log(<TLog>{ level: "verbose", message: `[Route] Registering GET ${this._path}` });

    router.get(this._path, (request, response) => {
      this.ProcessRequest(request, response);
    });

    return router;
  }
}
