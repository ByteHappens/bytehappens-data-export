let Telegram = require("winston-telegram");

import { WinstonTransportConfiguration } from "common/logging/winston";

import { IWinstonTelegramTransportConfiguration } from "./interfaces/iwinstontelegramtransportconfiguration";

export class WinstonTelegramTransportConfiguration extends WinstonTransportConfiguration
  implements IWinstonTelegramTransportConfiguration {
  public readonly token: string;
  public readonly chatId: number;
  public readonly disableNotification: boolean;

  constructor(token: string, chatId: number, disableNotification: boolean, level: string) {
    super(level);

    this.token = token;
    this.chatId = chatId;
    this.disableNotification = disableNotification;
  }

  public Validate(): void {
    super.Validate();

    if (this.token === undefined || this.token.length === 0 || this.chatId === undefined) {
      throw new Error("Invalid Telegram logging token");
    }

    if (this.chatId === undefined) {
      throw new Error("Invalid Telegram logging chatId");
    }
  }

  public async InitTransportAsync(): Promise<any> {
    let transportOptions = {
      level: this.level,
      token: this.token,
      chatId: this.chatId,
      disableNotification: this.disableNotification
    };

    let response: any = new Telegram(transportOptions);
    return response;
  }
}
