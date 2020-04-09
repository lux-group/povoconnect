import { Connection } from "jsforce";

import { connect } from "./connection";
import { retrieve as processSync } from "./retrieve";
import { list as queueupSync } from "./list";
import { subscribe as queueupSFEventLogs } from "./streaming";

import {
  ModelMappedCallback,
  MessageReceiveCallback,
  IdReceiveCallback,
  Credentials,
  Message,
  Subscription
} from "./types";

export {
  ModelMappedCallback,
  MessageReceiveCallback,
  IdReceiveCallback,
  Credentials,
  Message,
  Subscription,
  connect,
  processSync,
  queueupSync,
  queueupSFEventLogs
};

export async function processSFEventLogs<O, M>(
  conn: Connection,
  sobjectName: string,
  messages: Message[],
  mapper: (o: O) => M,
  onCreate: ModelMappedCallback<M>,
  onUpdate: ModelMappedCallback<M>,
  onDelete: IdReceiveCallback,
  onUnDelete: IdReceiveCallback,
  fields?: string[]
): Promise<void> {
  for (const message of messages) {
    if (message.event.type === "deleted") {
      await onDelete(message.sobject.Id);
      continue;
    }

    if (message.event.type === "undeleted") {
      await onUnDelete(message.sobject.Id);
      continue;
    }

    const callback = message.event.type === "updated" ? onUpdate : onCreate;

    await processSync<O, M>(
      conn,
      sobjectName,
      message.sobject.Id,
      mapper,
      callback,
      fields
    );
  }
}
