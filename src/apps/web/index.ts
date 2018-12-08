require("module-alias/register");

import { IStartableApplication } from "common/runtime/application";

import { Initialiser } from "./initialiser";

let initialser = new Initialiser();
initialser.InitialiseAsync().then((application: IStartableApplication) => application.Start());
