import { Connection } from "jsforce";
import csv from "csv-parser";

import { createSOQL } from "./soql";
import { ListTimeOutError } from "./errors";
import { Query, ModelMappedCallback } from "./types";

function getFields(query?: Query): string[] {
  const idOnly = ["Id"];

  if (!query) {
    return idOnly;
  }

  if (!query.fields) {
    return idOnly;
  }

  return query.fields;
}

function getWhere(query?: Query): string | null {
  if (!query) {
    return null;
  }

  if (!query.where) {
    return null;
  }

  return query.where;
}

function getLimit(query?: Query): number | null {
  if (!query) {
    return null;
  }

  if (!query.limit) {
    return null;
  }

  return query.limit;
}

export async function find<O, M>(
  conn: Connection,
  sobjectName: string,
  timeout: number,
  mapper: (sobject: O) => M,
  onReceive: ModelMappedCallback<M>,
  query?: Query
): Promise<void> {
  conn.bulk.pollTimeout = timeout;

  const onTimeout = (): void => {
    throw new ListTimeOutError(timeout);
  };

  const to = setTimeout(onTimeout, timeout);

  const fields = getFields(query);

  const where = getWhere(query);

  const limit = getLimit(query);

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

        for (const sobject of sobjects) {
          await onReceive(mapper(sobject));
        }

        resolve();
      })
      .on("error", reject);
  });
}
