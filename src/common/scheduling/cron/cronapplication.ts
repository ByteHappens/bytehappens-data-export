import { CronJob } from "cron";

import { ILog, ILogger, ILoggerFactory } from "common/logging";
import { BaseApplication } from "common/runtime/application";
import { ITask } from "common/runtime/task";

export class CronApplication<
  TLog extends ILog,
  TLogger extends ILogger<TLog>,
  TLoggerFactory extends ILoggerFactory<TLog, TLogger>
> extends BaseApplication<TLog, TLogger, TLoggerFactory> {
  private readonly _cronTime: string;
  private readonly _task: ITask;
  private readonly _job: CronJob;

  public constructor(task: ITask, cronTime: string, applicationName: string, loggerFactory: TLoggerFactory) {
    super(applicationName, loggerFactory);

    this._cronTime = cronTime;
    this._task = task;
    this._job = new CronJob(this._cronTime, async () => await this._task.RunAsync());
  }

  protected async StartInternalAsync(): Promise<void> {
    this._logger.Log(<TLog>{
      level: "verbose",
      message: `Starting ${this._applicationName} application with cron schedule ${this._cronTime}`
    });

    this._job.start();
  }
}
