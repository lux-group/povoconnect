import { Connection } from "jsforce";
import csv from "csv-parser";

import { createSOQL, parseQuery, Query } from "./soql";
import { FindAllTimeOutError } from "./errors";

export async function find<O, M>(
  conn: Connection,
  sobjectName: string,
  timeout: number,
  mapper: (sobject: O) => M,
  query?: Query
): Promise<M[]> {
  conn.bulk.pollTimeout = timeout;

  const onTimeout = (): void => {
    throw new FindAllTimeOutError(timeout);
  };

  const to = setTimeout(onTimeout, timeout);

  const { fields, where, limit } = parseQuery(query);

  const soql = createSOQL(sobjectName, fields, where, limit);

  const sobjects: O[] = [];

  return new Promise((resolve, reject) => {
    conn.bulk
      .query(soql)
      .stream()
      .pipe(csv())
      .on("data", (sobject: O) => {
        sobjects.push(sobject);
      })
      .on("end", async () => {
        clearTimeout(to);
        resolve(sobjects.map(mapper));
      })
      .on("error", reject);
  });
}
