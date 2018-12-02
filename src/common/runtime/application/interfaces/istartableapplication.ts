import { IApplication } from "./iapplication";

export interface IStartableApplication extends IApplication {
  Start(): void;
}
