import { Connection } from "jsforce";

import { connect } from "./connection";
import { find as findOne } from "./findOne";
import { find as findAll } from "./findAll";
import { subscribe } from "./streaming";
import { createSOQL } from "./soql";

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
  findOne,
  findAll,
  subscribe,
  createSOQL
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

    await findOne<O, M>(
      conn,
      sobjectName,
      message.sobject.Id,
      mapper,
      callback,
      fields
    );
  }
}
