/// <reference types="./types/@luxuryescapes/lib-factories" />

import "mocha";
import { assert } from "chai";

import { queueupSFEventLogs, Message } from "../src";

import * as credentials from "./support/credentials";
import { connect } from "./support/connection";

describe("queueupSFEventLogs", function() {
  it("subscribes to topic and recieves a message", async () => {
    let message: Message | undefined;

    const subscription = {
      topic: "OpportunityUpdates",
      replayId: 1
    };

    const onReceive = async (m: Message): Promise<void> => {
      message = m;
    };

    const conn = await connect(credentials);

    await queueupSFEventLogs(conn, subscription, 1, onReceive);

    assert(message);
  });
});
