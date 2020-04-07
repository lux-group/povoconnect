import { Connection } from "jsforce";

import { connect, Credentials } from "./connection";
import { subscribe, Subscription, Message } from "./streaming";

export { connect, Credentials, Subscription, Message };

export async function fetchSFEventLogs(
  conn: Connection,
  subscriptions: Subscription[],
  timeout: number
): Promise<void> {
  const subscribers: Promise<void>[] = [];

  for (const subscription of subscriptions) {
    const subscriber = subscribe(conn, subscription, timeout);
    subscribers.push(subscriber);
  }

  await Promise.all(subscribers);
}
