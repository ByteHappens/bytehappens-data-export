import { IWinstonConfiguration } from "./iwinstonconfiguration";

export interface IWinstonTelegramConfiguration extends IWinstonConfiguration {
  token: string;
  chatId: number;
  disableNotification: boolean;
}
