/// <reference types="./types/@luxuryescapes/lib-factories" />

import "mocha";
import { assert } from "chai";

import { processSFEventLogs, Message } from "../src";

import * as credentials from "./support/credentials";
import { build } from "./support/factories";
import { OpportunitySObject, OpportunityModel } from "./support/types";
import { OpportunityMapper } from "./support/mapping";
import { connect } from "./support/connection";

describe("Integration Tests", function() {
  this.timeout(10000);

  it("inserts sf event logs", async () => {
    let model: OpportunityModel | undefined;

    const conn = await connect(credentials);

    const messages = [build<Message>("Message")];

    const onReceive = async (opportunity: OpportunityModel): Promise<void> => {
      model = opportunity;
    };

    await processSFEventLogs<OpportunitySObject, OpportunityModel>(
      conn,
      "Opportunity",
      messages,
      OpportunityMapper,
      onReceive
    );

    if (!model) {
      throw new Error("model is undefined");
    }

    assert(model.sfid);
    assert(model.name);
    assert(model.systemmodstamp);
    assert(model.createddate);
  });
});
