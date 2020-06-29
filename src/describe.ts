import { Connection, DescribeSObjectResult } from "jsforce";

export async function describe(
  conn: Connection,
  sobjectName: string
): Promise<DescribeSObjectResult> {
  const meta = await conn.sobject(sobjectName).describe();

  return meta;
}
