import { config } from "dotenv";

import { IApplication } from "common/runtime/application";

export abstract class BaseInititaliser<T extends IApplication> {
  private InitialiseEnvironment(): void {
    if (process.env.NODE_ENV !== "production") {
      config();
    }
  }

  protected abstract InitialiseInternalAsync(): Promise<T>;

  public async InitialiseAsync(): Promise<T> {
    this.InitialiseEnvironment();
    
    let application: T = await this.InitialiseInternalAsync();
    return application;
  }
}
