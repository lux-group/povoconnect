import { Connection } from "jsforce";
import { Fields } from "./types";

export async function find<O, M>(
  conn: Connection,
  sobjectName: string,
  sobjectId: string,
  mapper: (sobject: O) => M,
  fields?: Fields
): Promise<M> {
  const sobject = await conn
    .sobject<O>(sobjectName)
    .retrieve(sobjectId, { fields });
  return mapper(sobject);
}
