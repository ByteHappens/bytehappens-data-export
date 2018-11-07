import { Logger } from "winston";
import * as express from "express";

import { BaseApp } from "../../app";

export interface IExpressRoute {
  Register(app: express.Application): void;
  ProcessRequest(request: express.Request, response: express.Response): void;
}

export abstract class BaseExpressRoute implements IExpressRoute {
  private readonly _path: string;
  protected readonly _logger: Logger;

  public constructor(path: string, logger: Logger) {
    this._path = path;
    this._logger = logger;
  }

  protected abstract ProcessRequestInternal(
    request: express.Request,
    response: express.Response
  );

  public Register(app: express.Application): void {
    this._logger.verbose(`Registering path ${this._path}`);

    app.get(this._path, (request, response) => {
      this.ProcessRequest(request, response);
    });
  }

  public ProcessRequest(
    request: express.Request,
    response: express.Response
  ): void {
    this._logger.verbose("Processing request");
    this.ProcessRequestInternal(request, response);
  }
}

export class ExpressApp extends BaseApp {
  private readonly _host: string;
  private readonly _port: number;
  private readonly _routes: IExpressRoute[];
  private readonly _app: express.Application;

  public constructor(
    host: string,
    port: number,
    routes: IExpressRoute[],
    appName: string,
    logger: Logger
  ) {
    super(appName, logger);

    this._host = host;
    this._port = port;
    this._routes = routes;

    this._app = express();
  }

  protected StartInternal(): void {
    this._logger.info(`Listening on host ${this._host} and port ${this._port}`);

    this._routes.forEach((route: IExpressRoute) => route.Register(this._app));
    this._app.listen(this._port, this._host);
  }
}
