import { Connection } from "jsforce";

import { connect, Credentials } from "./connection";
import { subscribe, Subscription, Message } from "./streaming";
import { retrieve } from "./retrieve";

export { connect, Credentials, Subscription, Message };

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
  mapper: (o: O) => M,
  messages: Message[],
  onReceive: (model: M) => Promise<void>
): Promise<void> {
  for (const message of messages) {
    await retrieve<O, M>(
      conn,
      sobjectName,
      message.sobject.Id,
      mapper,
      onReceive
    );
  }
}
