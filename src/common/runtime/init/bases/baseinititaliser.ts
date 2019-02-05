import { config } from "dotenv";

import { ITask } from "common/runtime/task";

export abstract class BaseInititaliser<T extends ITask> {
  private InitialiseEnvironment(): void {
    if (process.env.NODE_ENV !== "production") {
      config();
    }
  }

  protected abstract InitialiseInternalAsync(): Promise<T>;

  public async InitialiseAsync(): Promise<T> {
    this.InitialiseEnvironment();

    let task: T = await this.InitialiseInternalAsync();
    return task;
  }
}
