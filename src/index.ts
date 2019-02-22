require("module-alias/register");

import { runtimes } from "bytehappens";

import { RuntimeFactory } from "./runtimefactory";

let runtimeFactory = new RuntimeFactory();
runtimeFactory.CreateRuntimeAsync().then(async (runtime: runtimes.core.IRuntime) => await runtime.RunAsync());
