import { Connection } from "jsforce";

import { createSOQL, parseQuery, Query } from "./soql";

export async function find<O, M>(
  conn: Connection,
  sobjectName: string,
  maxFetch: number,
  mapper: (sobject: O) => M,
  query?: Query
): Promise<M[]> {
  const { fields, where, limit } = parseQuery(query);

  const soql = createSOQL(sobjectName, fields, where, limit);

  const models: M[] = [];

  return new Promise((resolve, reject) => {
    conn
      .query(soql)
      .on("record", (sobject: O) => {
        models.push(mapper(sobject));
      })
      .on("end", async () => {
        resolve(models);
      })
      .on("error", reject)
      .run({ autoFetch: true, maxFetch });
  });
}
