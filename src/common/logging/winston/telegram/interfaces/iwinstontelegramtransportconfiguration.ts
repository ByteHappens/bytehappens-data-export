import { IWinstonTransportConfiguration } from "../../interfaces/iwinstontransportconfiguration";

export interface IWinstonTelegramTransportConfiguration extends IWinstonTransportConfiguration {
  token: string;
  chatId: number;
  disableNotification: boolean;
}
