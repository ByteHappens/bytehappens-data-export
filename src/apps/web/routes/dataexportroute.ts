import { Logger } from "winston";

import { Request, Response } from "express";
import { Parser } from "json2csv";

import { BaseSimpleGetExpressRoute } from "common/hosting/express";

export class DataExportRoute extends BaseSimpleGetExpressRoute {
  private GetContent(): string {
    let fields: string[] = ["Sku", "Title", "Short Description", "Long Description", "Price", "In Stock", "Stock", "Delivery (days)"];
    let delimiter: string = ";";
    let data: any[] = [
      {
        Sku: "EBU_001",
        Title: "ByteHappens T Shirt (Green)",
        "Short Description": "ByteHappens T Shirt",
        "Long Description": "A ByteHappens T Shirt. Nuf said.",
        Price: 24.99,
        "In Stock": "No",
        Stock: 0,
        "Delivery (days)": 99
      }
    ];

    let options: any = { fields, delimiter };
    let parser: any = new Parser(options);
    return parser.parse(data);
  }
  protected ProcessRequestInternal(request: Request, response: Response): void {
    this._logger.info("Exporting data to CSV");

    try {
      let content: string = this.GetContent();

      response.status(200);
      response.type("csv");
      response.send(content);
    } catch (error) {
      this._logger.error("HMMM", { error });
      throw error;
    }
  }
}
