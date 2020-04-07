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
  replayId: number | null;
}

const allRetainedEvents = -2;

export async function subscribe(
  conn: Connection,
  { topic, replayId }: Subscription,
  timeout: number,
  onReceive: (message: Message) => Promise<void>
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

  return new Promise(resove => {
    const onTimeout = (): void => {
      listner.cancel();
      resove();
    };
    setTimeout(onTimeout, timeout);
  });
}
