import { Connection } from "jsforce";
import { ModelMappedCallback, Fields } from "./types";

export async function find<O, M>(
  conn: Connection,
  sobjectName: string,
  sobjectId: string,
  mapper: (sobject: O) => M,
  onReceive: ModelMappedCallback<M>,
  fields?: Fields
): Promise<void> {
  const sobject = await conn
    .sobject<O>(sobjectName)
    .retrieve(sobjectId, { fields });
  const model = mapper(sobject);
  await onReceive(model);
}
