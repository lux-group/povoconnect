import { Connection } from "jsforce";

import { connect, Credentials } from "./connection";
import { subscribe, Subscription, Message } from "./streaming";
import { retrieve } from "./retrieve";
import { list } from "./list";

export { connect, Credentials, Subscription, Message };

export async function processSync<O, M>(
  conn: Connection,
  sobjectName: string,
  sobjectId: string,
  mapper: (o: O) => M,
  onReceive: (model: M) => Promise<void>,
  fields?: string[]
): Promise<void> {
  await retrieve<O, M>(conn, sobjectName, sobjectId, mapper, onReceive, fields);
}

export async function queueupSync(
  conn: Connection,
  sobjectName: string,
  timeout: number,
  onReceive: (sfid: string) => Promise<void>
): Promise<void> {
  await list(conn, sobjectName, timeout, onReceive);
}

export async function queueupSFEventLogs(
  conn: Connection,
  subscription: Subscription,
  timeout: number,
  onReceive: (message: Message) => Promise<void>
): Promise<void> {
  await subscribe(conn, subscription, timeout, onReceive);
}

export async function processSFEventLogs<O, M>(
  conn: Connection,
  sobjectName: string,
  messages: Message[],
  mapper: (o: O) => M,
  onReceive: (model: M) => Promise<void>,
  fields?: string[]
): Promise<void> {
  for (const message of messages) {
    await processSync<O, M>(
      conn,
      sobjectName,
      message.sobject.Id,
      mapper,
      onReceive,
      fields
    );
  }
}
