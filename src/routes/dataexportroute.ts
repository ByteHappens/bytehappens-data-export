import { Request, Response } from "express";
import { Parser } from "json2csv";
import { logging } from "bytehappens";

import { BaseSimpleGetExpressRoute } from "common/hosting/express";

export class DataExportRoute<
  TLog extends logging.ILog,
  TLogger extends logging.ILogger<TLog>,
  TLoggerFactory extends logging.ILoggerFactory<TLog, TLogger>
> extends BaseSimpleGetExpressRoute<TLog, TLogger, TLoggerFactory> {
  private GetFields(): string[] {
    return ["Sku", "Title", "Short Description", "Long Description", "Price", "In Stock", "Stock", "Delivery (days)"];
  }

  private GetData(): any[] {
    return [
      {
        Sku: "EBU_001",
        Title: "ByteHappens T Shirt (Green)",
        "Short Description": "ByteHappens T Shirt",
        "Long Description": "A ByteHappens T Shirt. Nuf said.",
        Price: 24.99,
        "In Stock": "No",
        Stock: 0,
        "Delivery (days)": 99
      },
      {
        Sku: "EBU_002",
        Title: "ByteHappens T Shirt (Blue)",
        "Short Description": "ByteHappens T Shirt",
        "Long Description": "A ByteHappens T Shirt. Nuf said.",
        Price: 24.99,
        "In Stock": "No",
        Stock: 0,
        "Delivery (days)": 99
      },
      {
        Sku: "EBU_003",
        Title: "ByteHappens T Shirt (Pink)",
        "Short Description": "ByteHappens T Shirt",
        "Long Description": "A ByteHappens T Shirt. Nuf said.",
        Price: 24.99,
        "In Stock": "No",
        Stock: 0,
        "Delivery (days)": 99
      },
      {
        Sku: "EBU_004",
        Title: "ByteHappens T Shirt (Purple)",
        "Short Description": "ByteHappens T Shirt",
        "Long Description": "A ByteHappens T Shirt. Nuf said.",
        Price: 24.99,
        "In Stock": "No",
        Stock: 0,
        "Delivery (days)": 99
      },
      {
        Sku: "EBU_005",
        Title: "ByteHappens T Shirt (Red)",
        "Short Description": "ByteHappens T Shirt",
        "Long Description": "A ByteHappens T Shirt. Nuf said.",
        Price: 24.99,
        "In Stock": "No",
        Stock: 0,
        "Delivery (days)": 99
      },
      {
        Sku: "EBU_006",
        Title: "ByteHappens T Shirt (Orange)",
        "Short Description": "ByteHappens T Shirt",
        "Long Description": "A ByteHappens T Shirt. Nuf said.",
        Price: 24.99,
        "In Stock": "No",
        Stock: 0,
        "Delivery (days)": 99
      },
      {
        Sku: "EBU_007",
        Title: "ByteHappens T Shirt (Black)",
        "Short Description": "ByteHappens T Shirt",
        "Long Description": "A ByteHappens T Shirt. Nuf said.",
        Price: 24.99,
        "In Stock": "No",
        Stock: 0,
        "Delivery (days)": 99
      },
      {
        Sku: "EBU_008",
        Title: "ByteHappens T Shirt (White)",
        "Short Description": "ByteHappens T Shirt",
        "Long Description": "A ByteHappens T Shirt. Nuf said.",
        Price: 24.99,
        "In Stock": "No",
        Stock: 0,
        "Delivery (days)": 99
      },
      {
        Sku: "EBU_009",
        Title: "ByteHappens T Shirt (Rainbow)",
        "Short Description": "ByteHappens T Shirt",
        "Long Description": "A ByteHappens T Shirt. Nuf said.",
        Price: 24.99,
        "In Stock": "No",
        Stock: 0,
        "Delivery (days)": 99
      },
      {
        Sku: "EBU_010",
        Title: "ByteHappens T Shirt (Transparent)",
        "Short Description": "ByteHappens T Shirt",
        "Long Description": "A ByteHappens T Shirt. Nuf said.",
        Price: 24.99,
        "In Stock": "No",
        Stock: 0,
        "Delivery (days)": 99
      }
    ];
  }

  private GetExportConfiguration(): any {
    return {
      delimiter: ";"
    };
  }

  private GetContent(fields: string[], data: any[], exportConfiguration: any): string {
    let options: any = { fields, delimiter: exportConfiguration.delimiter };
    let parser: any = new Parser(options);
    return parser.parse(data);
  }

  protected ProcessRequestInternal(request: Request, response: Response): void {
    this._logger.Log(<TLog>{ level: "info", message: "Exporting data to CSV" });

    let fields: string[] = this.GetFields();
    let data: any[] = this.GetData();
    let exportConfiguration: any = this.GetExportConfiguration();
    let content: string = this.GetContent(fields, data, exportConfiguration);

    response.status(200);
    response.type("csv");
    response.send(content);
  }
}
