import { connect } from "./connection";
import { find as findOne } from "./findOne";
import { find as findAll } from "./findAll";
import { subscribe } from "./streaming";
import { createSOQL } from "./soql";

import {
  MessageReceiveCallback,
  Credentials,
  Message,
  Subscription
} from "./types";

export {
  MessageReceiveCallback,
  Credentials,
  Message,
  Subscription,
  connect,
  findOne,
  findAll,
  subscribe,
  createSOQL
};
