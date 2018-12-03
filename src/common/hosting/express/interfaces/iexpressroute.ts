import { Router } from "express";

export interface IExpressRoute {
  GetRouter(): Router;
}
