import { Request, Response, Router } from "express";

import { BaseExpressRoute } from "./baseexpressroute";

export abstract class BaseSimpleGetExpressRoute extends BaseExpressRoute {
  protected abstract ProcessRequestInternal(request: Request, response: Response);

  public ProcessRequest(request: Request, response: Response): void {
    this.ProcessRequestInternal(request, response);
  }

  public GetRouter(): Router {
    this._logger.verbose(`Creating router on ${this._path}`);
    let router: Router = Router();

    router.get(this._path, (request, response) => {
      this.ProcessRequest(request, response);
    });

    return router;
  }
}
