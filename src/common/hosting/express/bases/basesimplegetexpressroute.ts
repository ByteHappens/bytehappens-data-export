import { Request, Response, NextFunction, Router } from "express";
import { logging } from "bytehappens";

import { BaseExpressRoute } from "./baseexpressroute";

export abstract class BaseSimpleGetExpressRoute<
  TLog extends logging.ILog,
  TLogger extends logging.ILogger<TLog>,
  TLoggerFactory extends logging.ILoggerFactory<TLog, TLogger>
> extends BaseExpressRoute<TLog, TLogger, TLoggerFactory> {
  protected abstract ProcessRequestInternalAsync(request: Request, response: Response): Promise<void>;

  public async ProcessRequestAsync(request: Request, response: Response): Promise<void> {
    await this.ProcessRequestInternalAsync(request, response);
  }

  public GetRouter(): Router {
    let router: Router = Router();

    this._logger.Log(<TLog>{ level: "verbose", message: `[Route] Registering GET ${this._path}` });

    router.get(this._path, async (request: Request, response: Response, next: NextFunction) => {
      try {
        await this.ProcessRequestAsync(request, response);
      } catch (err) {
        next(err);
      }
    });

    return router;
  }
}
