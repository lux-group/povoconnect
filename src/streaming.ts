import { Connection, StreamingExtension } from "jsforce";

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
  replayId: () => Promise<number | null>;
  insert: (message: Message) => Promise<void>;
}

const allRetainedEvents = -2;

export async function subscribe(
  conn: Connection,
  subscription: Subscription,
  timeout: number
): Promise<void> {
  const replayId = await subscription.replayId();

  const channel = `/topic/${subscription.topic}`;

  const exitCallback = (): void => process.exit(1);
  const authFailureExt = new StreamingExtension.AuthFailure(exitCallback);

  const replayExt = new StreamingExtension.Replay(
    channel,
    replayId || allRetainedEvents
  );

  const client = conn.streaming.createClient([authFailureExt, replayExt]);

  const listner = client.subscribe(channel, (data: unknown) => {
    const message: Message = data as Message;
    subscription.insert(message);
  });

  return new Promise(resove => {
    const onTimeout = (): void => {
      listner.cancel();
      resove();
    };
    setTimeout(onTimeout, timeout);
  });
}
