import useSWR, { SWRResponse } from "swr";

import { parse } from "csv-parse/browser/esm/sync";

import { DATA_SOURCE_SPREADSHEET_URL } from "./constants";

async function spreadsheetFetcher<T extends object>(key: [string, string]) {
  if (key[0] !== "sheet") {
    throw new Error("Invalid key for spreadsheet fetcher");
  }

  const resp = await fetch(`${DATA_SOURCE_SPREADSHEET_URL}&gid=${key[1]}`);
  const body = await resp.text();

  const data = parse(body, { columns: true });

  return data.filter((d: T) => {
    const isVersionRow = Object.values(d).includes("VERSION");
    if (isVersionRow) {
      const version = Object.values(d).filter(
        (val) => val.length > 0 && val !== "VERSION",
      );
      console.debug(
        `Loaded spreadsheet for sheetId=${key[1]} with version=${version[0]}`,
      );
      return false;
    } else {
      return true;
    }
  });
}

export default function useSpreadsheetData<T extends object>(
  sheetId: string,
): SWRResponse<T[], any, any> {
  return useSWR(["sheet", sheetId], spreadsheetFetcher<T>);
}
