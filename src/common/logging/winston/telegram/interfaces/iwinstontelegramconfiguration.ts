import { IWinstonConfiguration } from "../../interfaces/iwinstonconfiguration";

export interface IWinstonTelegramConfiguration extends IWinstonConfiguration {
  token: string;
  chatId: number;
  disableNotification: boolean;
}
