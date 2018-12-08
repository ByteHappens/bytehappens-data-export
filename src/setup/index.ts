require("module-alias/register");

import { IRunnableApplication } from "common/runtime/application";
import { Initialiser } from "./initialiser";

let initialiser: Initialiser = new Initialiser();
initialiser.InitialiseAsync().then(async (application: IRunnableApplication) => {
  if (application != undefined) {
    await application.RunAsync();
  }
});
