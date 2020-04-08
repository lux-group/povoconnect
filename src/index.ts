import { Connection } from "jsforce";

import { connect, Credentials } from "./connection";
import { retrieve as processSync } from "./retrieve";
import { list as queueupSync } from "./list";
import {
  subscribe as queueupSFEventLogs,
  Subscription,
  Message
} from "./streaming";

export {
  connect,
  Credentials,
  Subscription,
  Message,
  queueupSync,
  processSync,
  queueupSFEventLogs
};

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
