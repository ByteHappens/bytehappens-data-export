import { Logger } from "winston";
import * as express from "express";

import { BaseStartableApplication } from "common/runtime/application";

import { IExpressRoute } from "./interfaces/iexpressroute";

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
