import { Request, Response } from "express";

import { BaseSimpleGetExpressRoute } from "common/hosting/express";

export class StatusRoute extends BaseSimpleGetExpressRoute {
  protected ProcessRequestInternal(request: Request, response: Response): void {
    response.status(204);
    response.send();
  }
}
