import { subscribe, findAll, findOne, Message, connect } from "./src";
import * as credentials from "./test/support/credentials";
import { OpportunitySObject, OpportunityModel } from "./test/support/types";
import { OpportunityMapper, OpportunityFields } from "./test/support/mapping";

async function povo(): Promise<void> {
  const conn = await connect(credentials);

  const messages: Message[] = [];

  const subscription = {
    topic: "OpportunityUpdates",
    replayId: null
  };

  const onReceiveMessage = async (message: Message): Promise<void> => {
    messages.push(message);
  };

  await subscribe(conn, subscription, 10000, onReceiveMessage);

  console.log("subscribe:", messages);

  const message = messages[0];

  if (message) {
    const model = await findOne<OpportunitySObject, OpportunityModel>(
      conn,
      "Opportunity",
      message.sobject.Id,
      OpportunityMapper,
      OpportunityFields
    );

    console.log("findOne: ", model);
  }

  const query = {
    where: "iswon = true",
    limit: 1,
    fields: OpportunityFields
  };

  const models = await findAll<OpportunitySObject, OpportunityModel>(
    conn,
    "Opportunity",
    60000,
    OpportunityMapper,
    query
  );

  console.log("findAll: ", models);
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
