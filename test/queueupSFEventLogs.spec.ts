/// <reference types="./types/@luxuryescapes/lib-factories" />

import "mocha";
import { assert } from "chai";

import { queueupSFEventLogs } from "../src";

import * as credentials from "./support/credentials";
import { connect } from "./support/connection";

describe("Integration Tests", function() {
  this.timeout(10000);

  it("inserts sf event logs", async () => {
    let inserted = false;

    const subscription = {
      topic: "OpportunityUpdates",
      replayId: 1
    };

    const onReceive = async (): Promise<void> => {
      inserted = true;
    };

    const conn = await connect(credentials);

    await queueupSFEventLogs(conn, subscription, 1000, onReceive);

    assert(inserted);
  });
});
