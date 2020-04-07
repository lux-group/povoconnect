/// <reference types="./types/@luxuryescapes/lib-factories" />

import "mocha";
import { assert } from "chai";

import { fetchSFEventLogs } from "../src";

import * as credentials from "./support/credentials";
import { connect } from "./support/connection";
// import { connect } from "../src";

describe("Integration Tests", function() {
  this.timeout(10000);

  it("inserts sf event logs", async () => {
    let inserted = false;

    const subscriptions = [
      {
        topic: "OpportunityUpdates",
        replayId: async (): Promise<number> => 1,
        insert: async (): Promise<void> => {
          inserted = true;
        }
      }
    ];

    const conn = await connect(credentials);

    await fetchSFEventLogs(conn, subscriptions, 1000);

    assert(inserted);
  });
});
