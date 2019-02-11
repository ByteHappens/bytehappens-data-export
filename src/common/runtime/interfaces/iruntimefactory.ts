import { IRuntime } from "./iruntime";

export interface IRuntimeFactory<TRuntime extends IRuntime> {
  CreateRuntimeAsync(): Promise<TRuntime>;
}
