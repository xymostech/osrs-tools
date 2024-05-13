import useSWR, { SWRResponse } from "swr";

import { parse } from "csv-parse/browser/esm/sync";

import { DATA_SOURCE_SPREADSHEET_URL } from "./constants";

async function spreadsheetFetcher(key: [string, string]) {
  if (key[0] !== "sheet") {
    throw new Error("Invalid key for spreadsheet fetcher");
  }

  const resp = await fetch(`${DATA_SOURCE_SPREADSHEET_URL}&gid=${key[1]}`);
  const body = await resp.text();

  return parse(body, { columns: true });
}

export default function useSpreadsheetData<T>(
  sheetId: string,
): SWRResponse<T, any, any> {
  return useSWR(["sheet", sheetId], spreadsheetFetcher);
}
