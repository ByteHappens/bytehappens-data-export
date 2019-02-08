import { Request, Response } from "express";

import { ILog, ILogger, ILoggerFactory } from "common/logging";
import { BaseSimpleGetExpressRoute } from "common/hosting/express";

export class StatusRoute<
  TLog extends ILog,
  TLogger extends ILogger<TLog>,
  TLoggerFactory extends ILoggerFactory<TLog, TLogger>
> extends BaseSimpleGetExpressRoute<TLog, TLogger, TLoggerFactory> {
  protected ProcessRequestInternal(request: Request, response: Response): void {
    response.status(204);
    response.send();
  }
}
