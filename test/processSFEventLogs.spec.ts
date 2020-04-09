/// <reference types="./types/@luxuryescapes/lib-factories" />

import "mocha";
import { assert } from "chai";

import { processSFEventLogs, Message } from "../src";

import * as credentials from "./support/credentials";
import { build } from "./support/factories";
import { OpportunitySObject, OpportunityModel } from "./support/types";
import { OpportunityMapper } from "./support/mapping";
import { connect } from "./support/connection";

describe("processSFEventLogs", function() {
  it("retrieves a model from a message", async () => {
    let model: OpportunityModel | undefined;

    const conn = await connect(credentials);

    const messages: Message[] = [
      build<Message>("Message", { event: { type: "updated" } })
    ];

    const onCreate = async (): Promise<void> => {
      return;
    };

    const onUpdate = async (opportunity: OpportunityModel): Promise<void> => {
      model = opportunity;
    };

    const onDelete = async (): Promise<void> => {
      return;
    };

    const onUnDelete = async (): Promise<void> => {
      return;
    };

    await processSFEventLogs<OpportunitySObject, OpportunityModel>(
      conn,
      "Opportunity",
      messages,
      OpportunityMapper,
      onCreate,
      onUpdate,
      onDelete,
      onUnDelete
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
