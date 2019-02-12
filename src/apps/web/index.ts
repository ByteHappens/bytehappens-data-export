require("module-alias/register");

import { runtime } from "bytehappens";

import { RuntimeFactory } from "./runtimefactory";

let runtimeFactory = new RuntimeFactory();
runtimeFactory.CreateRuntimeAsync().then(async (runtime: runtime.IRuntime) => await runtime.RunAsync());
