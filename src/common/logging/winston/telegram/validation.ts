import { ValidateConfiguration } from "../validation";
import { IWinstonTelegramConfiguration } from "./interfaces/iwinstontelegramconfiguration";

export function ValidateTelegramConfiguration(configuration: IWinstonTelegramConfiguration): void {
  ValidateConfiguration(configuration);

  if (configuration.token === undefined || configuration.chatId === undefined) {
    throw new Error("Invalid Telegram onfiguration detected");
  }
}
