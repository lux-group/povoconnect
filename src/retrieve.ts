import { Connection } from "jsforce";

export async function retrieve<O, M>(
  conn: Connection,
  sobjectName: string,
  sobjectId: string,
  mapper: (sobject: O) => M,
  onReceive: (model: M) => Promise<void>,
  fields?: string[]
): Promise<void> {
  const sobject = await conn
    .sobject<O>(sobjectName)
    .retrieve(sobjectId, { fields });
  const model = mapper(sobject);
  await onReceive(model);
}
