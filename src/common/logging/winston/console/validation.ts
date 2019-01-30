import { ValidateConfiguration } from "../validation";
import { IWinstonConsoleConfiguration } from "./interfaces/iwinstonconsoleconfiguration";

export function ValidateConsoleConfiguration(configuration: IWinstonConsoleConfiguration): void {
  ValidateConfiguration(configuration);
}
