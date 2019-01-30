let Telegram = require("winston-telegram");

import { IWinstonTelegramConfiguration } from "./interfaces/iwinstontelegramconfiguration";
import { ValidateTelegramConfiguration } from "./validation";

export function InitTelegramTransport(configuration: IWinstonTelegramConfiguration) {
  ValidateTelegramConfiguration(configuration);

  let transportOptions = {
    level: configuration.level,
    token: configuration.token,
    chatId: configuration.chatId,
    disableNotification: configuration.disableNotification
  };

  let response: any = new Telegram(transportOptions);
  return response;
}
