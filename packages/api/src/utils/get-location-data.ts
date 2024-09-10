import { GoogleSpreadsheet } from "google-spreadsheet";
import path from "path";
import fs from "fs";

export const creds = {
  private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY!,
  client_email: process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL!,
};

export const getLocationData = async () => {
  console.log("test!");
  // Initialize the sheet - doc ID is the long id in the sheets URL
  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!);
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
  const data = [];
  for (const row of rows) {
    const obj: Record<string, string> = {};
    for (const key of header) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      obj[key] = row[key];
    }
    data.push(obj);
  }
  console.log("data", data.length, data[0]);

  // print data to mock.ts using fs
  fs.writeFileSync(
    path.join(process.cwd(), "../../packages/shared/src/app", "mock.ts"),
    `export const mapData = ${JSON.stringify(data, null, 2)};`,
  );
};

void getLocationData();
