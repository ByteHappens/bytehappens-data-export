export interface ITask {
  InitAsync(): Promise<void>;
  ExecuteAsync(): Promise<boolean>;
}
