import { config } from "dotenv";

export async function InitialiseEnvironmentAsync(): Promise<void> {
  if (process.env.NODE_ENV !== "production") {
    config();
  }
}
