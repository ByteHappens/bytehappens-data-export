import { Request, Response } from "express";

export interface IErrorHandler {
  Handle(error: any, request: Request, response: Response): void;
}
