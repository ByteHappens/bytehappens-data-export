import { Logger } from "winston";
import * as express from "express";

import { BaseApp } from "../../app";

export abstract class ExpressApp extends BaseApp {
  private readonly _host: string;
  private readonly _port: number;
  private readonly _app: express.Application;

  constructor(host: string, port: number, appName: string, logger: Logger) {
    super(appName, logger);
    this._host = host;
    this._port = port;

    this._app = express();
    this._app.get("/", (request, response) =>
      this.ProcessRequest(request, response)
    );
  }

  protected StartInternal(): void {
    this._logger.info(`Listening on host ${this._host} and port ${this._port}`);
    this._app.listen(this._port, this._host);
  }

  protected abstract ProcessRequest(request, response): void;
}
