import {
  queueupSFEventLogs,
  processSFEventLogs,
  Message,
  connect
} from "./src";
import * as credentials from "./test/support/credentials";
import { OpportunitySObject, OpportunityModel } from "./test/support/types";
import { OpportunityMapper } from "./test/support/mapping";

const messages: Message[] = [];

const models: OpportunityModel[] = [];

const subscription = {
  topic: "OpportunityUpdates",
  replayId: null
};

async function onReceiveMessage(message: Message): Promise<void> {
  messages.push(message);
}

async function onReceiveModel(opportunity: OpportunityModel): Promise<void> {
  models.push(opportunity);
}

async function povo(): Promise<void> {
  const conn = await connect(credentials);

  await queueupSFEventLogs(conn, subscription, 10000, onReceiveMessage);

  await processSFEventLogs<OpportunitySObject, OpportunityModel>(
    conn,
    "Opportunity",
    OpportunityMapper,
    messages,
    onReceiveModel
  );
}

const main = async function(): Promise<void> {
  try {
    await povo();
    console.log("Success");
    process.exit(0);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
};

main();
