import { IRuntime } from "common/runtime";

export interface ITask extends IRuntime {
  GetResultAsync(): Promise<boolean>;
}
