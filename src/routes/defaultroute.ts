import { Request, Response } from "express";
import { logging } from "bytehappens";

import { BaseSimpleGetExpressRoute } from "common/hosting/express";

export class DefaultRoute<
  TLog extends logging.ILog,
  TLogger extends logging.ILogger<TLog>,
  TLoggerFactory extends logging.ILoggerFactory<TLog, TLogger>
> extends BaseSimpleGetExpressRoute<TLog, TLogger, TLoggerFactory> {
  protected async ProcessRequestInternalAsync(request: Request, response: Response): Promise<void> {
    response.status(200);
    response.send("I'm alive !");
  }
}
