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

const eventModels: OpportunityModel[] = [];

const listModels: OpportunityModel[] = [];

const subscription = {
  topic: "OpportunityUpdates",
  replayId: null
};

async function onReceiveMessage(message: Message): Promise<void> {
  messages.push(message);
}

async function onReceiveEventModel(
  opportunity: OpportunityModel
): Promise<void> {
  eventModels.push(opportunity);
}

async function onReceiveListModel(
  opportunity: OpportunityModel
): Promise<void> {
  listModels.push(opportunity);
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
    onReceiveEventModel,
    onReceiveEventModel,
    async (): Promise<void> => {
      return;
    },
    async (): Promise<void> => {
      return;
    },
    OpportunityFields
  );

  console.log("Event model count:", eventModels.length);

  const query = {
    where: "iswon = true",
    limit: 100,
    fields: OpportunityFields
  };

  await queueupSync<OpportunitySObject, OpportunityModel>(
    conn,
    "Opportunity",
    60000,
    OpportunityMapper,
    onReceiveListModel,
    query
  );

  console.log("List model count:", listModels.length);
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
