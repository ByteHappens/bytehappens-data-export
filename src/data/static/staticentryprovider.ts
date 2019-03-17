import { IEntryProvider } from "../interfaces/ientryprovider";

import { StaticField } from "./staticfield";
import { StaticEntry } from "./staticentry";

export class StaticEntryProvider implements IEntryProvider<StaticField, StaticEntry> {
  public async GetEntriesAsync(filename: string): Promise<StaticEntry[]> {
    if (filename !== "products") {
      throw new Error(`Unknown entries for ${filename} requested`);
    }

    return [
      new StaticEntry("EBU_001", {
        Sku: "EBU_001",
        Title: "ByteHappens T Shirt (Green)",
        "Short Description": "ByteHappens T Shirt",
        "Long Description": "A ByteHappens T Shirt. Nuf said.",
        Price: 24.99,
        "In Stock": "No",
        Stock: 0,
        "Delivery (days)": 99
      }),
      new StaticEntry("EBU_002", {
        Sku: "EBU_002",
        Title: "ByteHappens T Shirt (Blue)",
        "Short Description": "ByteHappens T Shirt",
        "Long Description": "A ByteHappens T Shirt. Nuf said.",
        Price: 24.99,
        "In Stock": "No",
        Stock: 0,
        "Delivery (days)": 99
      }),
      new StaticEntry("EBU_003", {
        Sku: "EBU_003",
        Title: "ByteHappens T Shirt (Pink)",
        "Short Description": "ByteHappens T Shirt",
        "Long Description": "A ByteHappens T Shirt. Nuf said.",
        Price: 24.99,
        "In Stock": "No",
        Stock: 0,
        "Delivery (days)": 99
      }),
      new StaticEntry("EBU_004", {
        Sku: "EBU_004",
        Title: "ByteHappens T Shirt (Purple)",
        "Short Description": "ByteHappens T Shirt",
        "Long Description": "A ByteHappens T Shirt. Nuf said.",
        Price: 24.99,
        "In Stock": "No",
        Stock: 0,
        "Delivery (days)": 99
      }),
      new StaticEntry("EBU_005", {
        Sku: "EBU_005",
        Title: "ByteHappens T Shirt (Red)",
        "Short Description": "ByteHappens T Shirt",
        "Long Description": "A ByteHappens T Shirt. Nuf said.",
        Price: 24.99,
        "In Stock": "No",
        Stock: 0,
        "Delivery (days)": 99
      }),
      new StaticEntry("EBU_006", {
        Sku: "EBU_006",
        Title: "ByteHappens T Shirt (Orange)",
        "Short Description": "ByteHappens T Shirt",
        "Long Description": "A ByteHappens T Shirt. Nuf said.",
        Price: 24.99,
        "In Stock": "No",
        Stock: 0,
        "Delivery (days)": 99
      }),
      new StaticEntry("EBU_007", {
        Sku: "EBU_007",
        Title: "ByteHappens T Shirt (Black)",
        "Short Description": "ByteHappens T Shirt",
        "Long Description": "A ByteHappens T Shirt. Nuf said.",
        Price: 24.99,
        "In Stock": "No",
        Stock: 0,
        "Delivery (days)": 99
      }),
      new StaticEntry("EBU_008", {
        Sku: "EBU_008",
        Title: "ByteHappens T Shirt (White)",
        "Short Description": "ByteHappens T Shirt",
        "Long Description": "A ByteHappens T Shirt. Nuf said.",
        Price: 24.99,
        "In Stock": "No",
        Stock: 0,
        "Delivery (days)": 99
      }),
      new StaticEntry("EBU_009", {
        Sku: "EBU_009",
        Title: "ByteHappens T Shirt (Rainbow)",
        "Short Description": "ByteHappens T Shirt",
        "Long Description": "A ByteHappens T Shirt. Nuf said.",
        Price: 24.99,
        "In Stock": "No",
        Stock: 0,
        "Delivery (days)": 99
      }),
      new StaticEntry("EBU_010", {
        Sku: "EBU_010",
        Title: "ByteHappens T Shirt (Transparent)",
        "Short Description": "ByteHappens T Shirt",
        "Long Description": "A ByteHappens T Shirt. Nuf said.",
        Price: 24.99,
        "In Stock": "No",
        Stock: 0,
        "Delivery (days)": 99
      })
    ];
  }
}
