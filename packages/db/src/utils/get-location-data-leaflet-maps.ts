import { GoogleSpreadsheet } from "google-spreadsheet";

import type { LeafletWorkoutData } from "@acme/shared/app/types";

export const creds = {
  private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY!,
  client_email: process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL!,
};

export const getLocationDataFromLeafletMaps = async () => {
  // Initialize the sheet - doc ID is the long id in the sheets URL
  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID);
  console.log("doc", !!doc);

  await doc.useServiceAccountAuth(creds);

  console.log("authenticated");

  await doc.loadInfo(); // loads document properties and worksheets

  const sheet = doc.sheetsByTitle.Points;
  if (!sheet) {
    throw new Error(`No sheet found`);
  }
  console.log("found sheet");

  await sheet.loadHeaderRow();
  const header = sheet.headerValues;
  console.log("header", header);

  const rows = await sheet?.getRows(); // can this use the row we just added?
  const data: LeafletWorkoutData[] = [];
  for (const row of rows) {
    const obj = header.reduce((acc, key) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      acc[key as keyof LeafletWorkoutData] = row[key];
      return acc;
    }, {} as LeafletWorkoutData);
    data.push(obj);
  }

  return data;
};
