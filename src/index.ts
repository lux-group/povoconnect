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

function callback<M>(
  eventType: string,
  onCreate: ModelMappedCallback<M>,
  onUpdate: ModelMappedCallback<M>,
  onDelete: ModelMappedCallback<M>
): ModelMappedCallback<M> {
  if (eventType === "updated") {
    return onUpdate;
  }

  if (eventType === "deleted") {
    return onDelete;
  }

  return onCreate;
}

export async function processSFEventLogs<O, M>(
  conn: Connection,
  sobjectName: string,
  messages: Message[],
  mapper: (o: O) => M,
  onCreate: ModelMappedCallback<M>,
  onUpdate: ModelMappedCallback<M>,
  onDelete: ModelMappedCallback<M>,
  fields?: string[]
): Promise<void> {
  for (const message of messages) {
    await processSync<O, M>(
      conn,
      sobjectName,
      message.sobject.Id,
      mapper,
      callback<M>(message.event.type, onCreate, onUpdate, onDelete),
      fields
    );
  }
}
