import { Request, Response } from "express";

import { IErrorHandler } from "../interfaces/ierrorhandler";

export abstract class BaseErrorHandler implements IErrorHandler {
  protected abstract HandleInternal(error: any, request: Request, response: Response): void;

  Handle(error: any, request: Request, response: Response): void {
    this.HandleInternal(error, request, response);
  }
}
