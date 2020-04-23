import { connect, Credentials } from "./connection";
import { find as findOne } from "./findOne";
import { find as findAll } from "./findAll";
import {
  subscribe,
  upsertTopic,
  deleteTopic,
  listTopics,
  MessageReceiveCallback,
  Message,
  Subscription
} from "./streaming";
import { createSOQL, parseQuery } from "./soql";

export {
  MessageReceiveCallback,
  Credentials,
  Message,
  Subscription,
  connect,
  findOne,
  findAll,
  subscribe,
  createSOQL,
  parseQuery,
  upsertTopic,
  deleteTopic,
  listTopics
};
