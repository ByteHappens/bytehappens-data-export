import { IApplication } from "./iapplication";

export interface IStartableApplication extends IApplication {
  StartAsync(): Promise<void>;
}
