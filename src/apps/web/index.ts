require("module-alias/register");

import { IRuntime } from "common/runtime";

import { RuntimeFactory } from "./runtimefactory";

let runtimeFactory = new RuntimeFactory();
runtimeFactory.CreateRuntimeAsync().then(async (runtime: IRuntime) => await runtime.RunAsync());
