import { Logger } from "winston";
import * as express from "express";

import { BaseApp } from "../../app";

export abstract class ExpressApp extends BaseApp {
  private readonly _port: number;
  private readonly _app: express.Application;

  constructor(port: number, appName: string, logger: Logger) {
    super(appName, logger);
    this._port = port;

    this._app = express();
    this._app.get("/", (request, response) =>
      this.ProcessRequest(request, response)
    );
  }

  protected StartInternal(): void {
    this._logger.info(`Listening on port ${this._port}`);

    this._app.listen(this._port);
  }

  protected abstract ProcessRequest(request, response): void;
}
