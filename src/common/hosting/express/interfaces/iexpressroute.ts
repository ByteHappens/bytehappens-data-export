import { Router } from "express";

export interface IExpressRoute {
  InitAsync(): Promise<void>;
  GetRouter(): Router;
}
