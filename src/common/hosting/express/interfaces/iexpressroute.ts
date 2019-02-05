import { Logger } from "winston";
import { Router } from "express";

export interface IExpressRoute {
  AttachLogger(logger: Logger): void;
  GetRouter(): Router;
}
