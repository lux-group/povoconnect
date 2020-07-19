// run with:
//
//   env $(cat .env) yarn smoke

import {
  subscribe,
  findAll,
  findOne,
  Message,
  connect,
  upsertTopic,
  deleteTopic,
  listTopics,
  describe
} from "./src";
import * as credentials from "./test/support/credentials";
import { OpportunitySObject, OpportunityModel } from "./test/support/types";
import { OpportunityMapper, OpportunityFields } from "./test/support/mapping";

async function povo(): Promise<void> {
  const conn = await connect(credentials);

  console.log(conn)
  // const meta = await describe(conn, "Opportunity");

  // console.log("describe:", meta.name);

  // const messages: Message[] = [];

  // const subscription = {
  //   topic: "OpportunityUpdates",
  //   replayId: null
  // };

  // const onReceiveMessage = async (message: Message): Promise<void> => {
  //   messages.push(message);
  // };

  // await subscribe(conn, subscription, 10000, onReceiveMessage);

  // console.log("subscribe:", messages);

  // const message = messages[0];

  // if (message) {
  //   const model = await findOne<OpportunitySObject, OpportunityModel>(
  //     conn,
  //     "Opportunity",
  //     message.sobject.Id,
  //     OpportunityMapper,
  //     OpportunityFields
  //   );

  //   console.log("findOne: ", model);
  // }

  const where = "iswon = true";

  const query = {
    where,
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

  // const topics = await listTopics(conn);

  // console.log(
  //   "listTopics: ",
  //   topics.map(topic => topic.Name)
  // );

  // const topic = await upsertTopic(conn, "Opportunity", "OpportunityUpdates", {
  //   where
  // });

  // console.log("upsertTopic: ", topic.Name);

  // await upsertTopic(conn, "Opportunity", "ToDeleteTopic");

  // await deleteTopic(conn, "ToDeleteTopic");

  // const toDeleteTopics = await listTopics(conn);

  // const shouldBeDeletedTopic = toDeleteTopics.find(
  //   topic => topic.Name === "ToDeleteTopic"
  // );

  // if (shouldBeDeletedTopic) {
  //   throw new Error("Should have deleted topic");
  // }

  // console.log("deleteTopic: ", true);
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
