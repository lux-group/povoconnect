import { PassThrough } from "readable-stream";
import { Connection } from "jsforce";

import { ListTimeOutError } from "./errors";
import { IdReceiveCallback } from "./types";

export async function list(
  conn: Connection,
  sobjectName: string,
  timeout: number,
  onReceive: IdReceiveCallback
): Promise<void> {
  let csvString = "";

  const onReceivePromiseList: Promise<void>[] = [];

  conn.bulk.pollTimeout = timeout;

  const onTimeout = (): void => {
    throw new ListTimeOutError(timeout);
  };

  const to = setTimeout(onTimeout, timeout);

  return new Promise((resolve, reject) => {
    conn.bulk
      .query(`SELECT Id FROM ${sobjectName}`)
      .stream()
      .pipe(new PassThrough())
      .on("data", (partialCsvString: Buffer) => {
        csvString = csvString.concat(partialCsvString.toString());
      })
      .on("end", () => {
        clearTimeout(to);
        // Process the CSV string into an array of IDs.
        // Step 1: Remove all the quotes around the values.
        // Notes: The call to replace is using a regex looking for the
        // double-quote (") character to replace it with an empty string. The g
        // at the end is for global which allows it to replace all occurances.
        // Otherwise it only replaces the first one.
        // Step 2: Split the string on the newline character to get an array
        // with a value for each line.
        const ids = csvString.replace(/"/g, "").split("\n");
        // Step 3: Remove the first element (CSV header row that says "Id")
        ids.shift();
        // Step 4: Remove the last element, which is an empty string because the
        // last character the stream sends is the newline character that we
        // split on.
        ids.pop();

        ids.forEach(id => onReceivePromiseList.push(onReceive(id)));

        Promise.all(onReceivePromiseList).then(() => resolve());
      })
      .on("error", reject);
  });
}
