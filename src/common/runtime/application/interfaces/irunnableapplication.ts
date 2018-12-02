import { IApplication } from "./iapplication";

export interface IRunnableApplication extends IApplication {
  RunAsync(): Promise<void>;
}
