import { config } from "dotenv";

import { IRuntime } from "../interfaces/iruntime";

export abstract class BaseRuntime implements IRuntime {
  private _init: Promise<void>;

  protected abstract RunInternalAsync(): Promise<void>;

  protected async InitialiseInternalAsync(): Promise<void> {
    if (process.env.NODE_ENV !== "production") {
      config();
    }
  }

  private InitialiseAsync(): Promise<void> {
    if (!this._init) {
      this._init = this.InitialiseInternalAsync();
    }

    return this._init;
  }

  public async RunAsync(): Promise<void> {
    await this.InitialiseAsync();
    await this.RunInternalAsync();
  }
}
