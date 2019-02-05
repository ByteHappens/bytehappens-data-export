import * as express from "express";

import { IWinstonLoggerFactory } from "common/logging/winston";
import { BaseStartableApplication } from "common/runtime/application";

import { IExpressRoute } from "./interfaces/iexpressroute";
import { IErrorHandler } from "./interfaces/ierrorhandler";

export class ExpressApplication extends BaseStartableApplication {
  private readonly _port: number;
  private readonly _routes: IExpressRoute[];
  private readonly _errorHandlers: IErrorHandler[];

  private readonly _expressApplication: express.Application;

  public constructor(
    port: number,
    routes: IExpressRoute[],
    errorHandlers: IErrorHandler[],
    applicationName: string,
    loggerFactory: IWinstonLoggerFactory
  ) {
    super(applicationName, loggerFactory);

    this._port = port;
    this._routes = routes;
    this._errorHandlers = errorHandlers;

    this._expressApplication = express();
  }

  private Register(route: IExpressRoute): void {
    let router = route.GetRouter();
    this._expressApplication.use(router);
  }

  private DefaultProcessError(
    error: any,
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ): void {
    if (this._logger) {
      this._logger.error("Something broke!", { error });
    }

    response.status(500);
    response.send("Something broke!");
  }

  protected async StartInternalAsync(): Promise<void> {
    if (this._logger) {
      this._logger.verbose(`Listening on port ${this._port}`);
    }

    if (this._routes !== undefined) {
      this._routes.forEach((route: IExpressRoute) => {
        route.AttachLogger(this._logger);
        this.Register(route);
      });
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
