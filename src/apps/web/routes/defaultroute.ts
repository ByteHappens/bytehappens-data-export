import { Request, Response } from "express";

import { BaseSimpleGetExpressRoute } from "common/hosting/express";

export class DefaultRoute extends BaseSimpleGetExpressRoute {
  protected ProcessRequestInternal(request: Request, response: Response): void {
    response.status(200);
    response.send("I'm alive !");
  }
}
