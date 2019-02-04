require("module-alias/register");

import { ITask } from "common/runtime/task";

import { Initialiser } from "./initialiser";

let initialser = new Initialiser();
initialser.InitialiseAsync().then(async (task: ITask) => await task.ExecuteAsync());
