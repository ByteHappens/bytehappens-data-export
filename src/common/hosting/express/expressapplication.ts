import * as express from "express";

import { ILog, ILogger, ILoggerFactory } from "common/logging";
import { BaseApplication } from "common/runtime/application";

import { IExpressRoute } from "./interfaces/iexpressroute";
import { IErrorHandler } from "./interfaces/ierrorhandler";

export class ExpressApplication<
  TLog extends ILog,
  TLogger extends ILogger<TLog>,
  TLoggerFactory extends ILoggerFactory<TLog, TLogger>
> extends BaseApplication<TLog, TLogger, TLoggerFactory> {
  private readonly _port: number;
  private readonly _routes: IExpressRoute[];
  private readonly _errorHandlers: IErrorHandler[];

  private readonly _expressApplication: express.Application;

  public constructor(
    port: number,
    routes: IExpressRoute[],
    errorHandlers: IErrorHandler[],
    applicationName: string,
    loggerFactory: TLoggerFactory
  ) {
    super(applicationName, loggerFactory);

    this._port = port;
    this._routes = routes;
    this._errorHandlers = errorHandlers;

    this._expressApplication = express();
  }

  private async RegisterAsync(route: IExpressRoute): Promise<void> {
    await route.InitAsync();
    let router = route.GetRouter();
    this._expressApplication.use(router);
  }

  private DefaultProcessError(
    error: any,
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ): void {
    this._logger.Log(<TLog>{
      level: "error",
      message: "Something broke!",
      meta: { error }
    });

    response.status(500);
    response.send("Something broke!");
  }

  protected async StartInternalAsync(): Promise<void> {
    this._logger.Log(<TLog>{
      level: "verbose",
      message: `Listening on port ${this._port}`
    });

    if (this._routes !== undefined) {
      await Promise.all(this._routes.map(async (route: IExpressRoute) => await this.RegisterAsync(route)));
    }

    if (this._errorHandlers !== undefined) {
      this._errorHandlers.forEach((errorHandler: IErrorHandler) => {
        this._expressApplication.use(
          (error: any, request: express.Request, response: express.Response, next: express.NextFunction) => {
            errorHandler.Handle(error, request, response);
            next();
          }
        );
      });
    }

    this._expressApplication.use(
      (error: any, request: express.Request, response: express.Response, next: express.NextFunction) => {
        this.DefaultProcessError(error, request, response, next);
      }
    );

    this._expressApplication.listen(this._port);
  }
}
