import { Logger } from "winston";
import * as express from "express";

import { BaseStartableApplication } from "common/runtime/application";

export interface IExpressRoute {
  GetRouter(): express.Router;
}

export abstract class BaseExpressRoute implements IExpressRoute {
  protected readonly _path: string;
  protected readonly _logger: Logger;

  public constructor(path: string, logger: Logger) {
    this._path = path;
    this._logger = logger;
  }

  public abstract GetRouter(): express.Router;
}

export abstract class BaseSimpleGetExpressRoute extends BaseExpressRoute {
  protected abstract ProcessRequestInternal(request: express.Request, response: express.Response);

  public ProcessRequest(request: express.Request, response: express.Response): void {
    this.ProcessRequestInternal(request, response);
  }

  public GetRouter(): express.Router {
    let router: express.Router = express.Router();

    router.get(this._path, (request, response) => {
      this.ProcessRequest(request, response);
    });

    return router;
  }
}

export class ExpressApplication extends BaseStartableApplication {
  private readonly _host: string;
  private readonly _port: number;
  private readonly _routes: IExpressRoute[];
  private readonly _expressApplication: express.Application;

  public constructor(host: string, port: number, routes: IExpressRoute[], applicationName: string, logger: Logger) {
    super(applicationName, logger);

    this._host = host;
    this._port = port;
    this._routes = routes;

    this._expressApplication = express();
  }

  private Register(route: IExpressRoute) {
    let router = route.GetRouter();
    this._expressApplication.use(router);
  }

  protected StartInternal(): void {
    this._logger.verbose(`Listening on host ${this._host} and port ${this._port}`);

    this._routes.forEach((route: IExpressRoute) => this.Register(route));
    this._expressApplication.listen(this._port, this._host);
  }
}
