import { Connection, StreamingExtension } from "jsforce";

import { Subscription, Message, MessageReceiveCallback } from "./types";

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

  return new Promise(resove => {
    const onTimeout = (): void => {
      listner.cancel();
      resove();
    };
    setTimeout(onTimeout, timeout);
  });
}
