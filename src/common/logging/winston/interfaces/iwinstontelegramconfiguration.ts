import { IWinstonConfiguration } from "./iwinstonconfiguration";

export interface IWinstonTelegramConfiguration extends IWinstonConfiguration {
  botToken: string;
  chatId: number;
  disableNotification: boolean;
}
