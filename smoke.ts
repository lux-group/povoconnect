import {
  queueupSFEventLogs,
  processSFEventLogs,
  queueupSync,
  Message,
  connect
} from "./src";
import * as credentials from "./test/support/credentials";
import { OpportunitySObject, OpportunityModel } from "./test/support/types";
import { OpportunityMapper, OpportunityFields } from "./test/support/mapping";

const messages: Message[] = [];

const models: OpportunityModel[] = [];

const ids: string[] = [];

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

async function onReceiveId(sfid: string): Promise<void> {
  ids.push(sfid);
}

async function povo(): Promise<void> {
  const conn = await connect(credentials);

  await queueupSFEventLogs(conn, subscription, 10000, onReceiveMessage);

  console.log("Message count:", messages.length);

  await processSFEventLogs<OpportunitySObject, OpportunityModel>(
    conn,
    "Opportunity",
    messages,
    OpportunityMapper,
    onReceiveModel,
    onReceiveModel,
    onReceiveModel,
    OpportunityFields
  );

  console.log("Models count:", models.length);

  await queueupSync(conn, "Opportunity", 60000, onReceiveId);

  console.log("ID count:", ids.length);
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
