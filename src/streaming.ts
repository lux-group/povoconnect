import { Connection, StreamingExtension } from "jsforce";

import { createSOQL, parseQuery, Query } from "./soql";
import { TopicCompileError, TopicExceptionError } from "./errors";

export interface Message {
  event: {
    createdDate: string;
    replayId: number;
    type: "updated" | "created" | "deleted" | "undeleted";
  };
  sobject: {
    Id: string;
  };
}

export interface Subscription {
  topic: string;
  replayId: number | null;
}

export type MessageReceiveCallback = (message: Message) => Promise<void>;

interface PushTopic {
  attributes: {
    type: string;
    url: string;
  };
  Id: string;
  Name: string;
  Query: string;
  ApiVersion: string;
  IsActive: string;
  NotifyForFields: string;
  NotifyForOperations: string;
  Description: string | null;
  NotifyForOperationCreate: boolean;
  NotifyForOperationUpdate: boolean;
  NotifyForOperationDelete: boolean;
  NotifyForOperationUndelete: boolean;
  IsDeleted: boolean;
  CreatedDate: string;
  CreatedById: string;
  LastModifiedDate: string;
  LastModifiedById: string;
  SystemModstamp: string;
}

const allRetainedEvents = -2;

export async function subscribe(
  conn: Connection,
  { topic, replayId }: Subscription,
  timeout: number,
  onReceive: MessageReceiveCallback
): Promise<void> {
  const channel = `/topic/${topic}`;

  const exitCallback = (): void => process.exit(1);
  const authFailureExt = new StreamingExtension.AuthFailure(exitCallback);

  const replayExt = new StreamingExtension.Replay(
    channel,
    replayId || allRetainedEvents
  );

  const client = conn.streaming.createClient([authFailureExt, replayExt]);

  const listner = client.subscribe(channel, (data: unknown) => {
    const message: Message = data as Message;
    onReceive(message);
  });

  return new Promise(resolve => {
    const onTimeout = (): void => {
      listner.cancel();
      resolve();
    };
    if (timeout !== Infinity) {
      setTimeout(onTimeout, timeout);
    }
  });
}

const apexUpsert = `
List<PushTopic> pushTopics = [SELECT Id, Query FROM PushTopic WHERE Name = '_PushTopicName_'];

if (pushTopics.isEmpty()) {
  PushTopic pushTopic = new PushTopic();
  pushTopic.Name = '_PushTopicName_';
  pushTopic.Query = '_PushTopicQuery_';
  pushTopic.ApiVersion = 48.0;
  pushTopic.NotifyForOperationCreate = true;
  pushTopic.NotifyForOperationUpdate = true;
  pushTopic.NotifyForOperationUndelete = true;
  pushTopic.NotifyForOperationDelete = true;
  pushTopic.NotifyForFields = 'All';
  insert pushTopic;
  return;
}

PushTopic pushTopic = pushTopics.get(0);

if (pushTopic.Query != '_PushTopicQuery_') {
  pushTopic.Query = '_PushTopicQuery_';
  update pushTopic;
  return;
}
`;

const apexDelete = `
List<PushTopic> pushTopics = [SELECT Id FROM PushTopic WHERE Name = '_PushTopicName_'];

if (pushTopics.isEmpty()) {
  return;
}

PushTopic pushTopic = pushTopics.get(0);
delete pushTopic;
return;
`;

async function executeApex(conn: Connection, body: string): Promise<void> {
  const res = await conn.tooling.executeAnonymous(body);

  if (!res.compiled) {
    throw new TopicCompileError(res.compileProblem);
  }

  if (!res.success) {
    throw new TopicExceptionError(res.exceptionMessage);
  }
}

export async function listTopics(conn: Connection): Promise<PushTopic[]> {
  const topics = (await conn
    .sobject<PushTopic>("PushTopic")
    .find()) as PushTopic[];

  return topics;
}

export async function upsertTopic(
  conn: Connection,
  sobjectName: string,
  topicName: string,
  query?: Query
): Promise<PushTopic> {
  const { fields, where, limit } = parseQuery(query);

  const soql = createSOQL(sobjectName, fields, where, limit);

  const body = apexUpsert
    .replace(/_PushTopicName_/g, topicName)
    .replace(/_PushTopicQuery_/g, soql);

  await executeApex(conn, body);

  const topics = await listTopics(conn);

  const topic = topics.find(topic => topic.Name === topicName);

  if (!topic) {
    throw new Error("Topic not found");
  }

  return topic;
}

export async function deleteTopic(
  conn: Connection,
  topicName: string
): Promise<void> {
  const body = apexDelete.replace(/_PushTopicName_/g, topicName);

  await executeApex(conn, body);

  return;
}
