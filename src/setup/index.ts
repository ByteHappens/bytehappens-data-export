require("module-alias/register");

import { ITask } from "common/runtime/task";
import { Initialiser } from "./initialiser";

let initialiser: Initialiser = new Initialiser();
initialiser.InitialiseAsync().then(async (task: ITask) => {
  if (task != undefined) {
    await task.ExecuteAsync();
  }
});
