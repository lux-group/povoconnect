import { EventEmitter } from "events";

import {
  Connection,
  ConnectionOptions,
  Streaming,
  StreamingMessage,
  Channel,
  Topic
} from "jsforce";

import { Credentials } from "../../src";

import { build } from "./factories";

function loop(
  listener: (streamingMessage: StreamingMessage) => void
): () => void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let to: any;

  const loop = (): void => {
    to = setTimeout(loop, 1000);
    listener(build<StreamingMessage>("Message"));
  };

  loop();

  return (): void => {
    clearTimeout(to);
  };
}

class MockTopic {
  constructor(streaming: MockStreaming, name: string) {
    this._streaming = streaming;
    this.name = name;
  }

  public _streaming: MockStreaming;

  public name: string;

  public __cancel: undefined | Function;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  subscribe(listener: (streamingMessage: StreamingMessage) => void): any {
    this.__cancel = loop(listener);
  }

  unsubscribe(): Topic {
    if (this.__cancel) {
      this.__cancel();
    }
    return this;
  }
}

class MockStreaming extends EventEmitter {
  constructor(conn: MockConnection) {
    super();
    this._conn = conn;
  }

  public _conn: MockConnection;

  channel(channelId: string): Channel {
    return new Channel(this, channelId);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  subscribe(): any {
    return;
  }

  topic(name: string): Topic {
    return new MockTopic(this, name);
  }

  unsubscribe(): Streaming {
    return this;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
  createClient(extensions?: Array<any>): any {
    return {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      subscribe: (channel: string, listener: (data: any) => void): any => {
        return {
          cancel: loop(listener)
        };
      }
    };
  }
}

class MockConnection extends Connection {
  constructor(params: ConnectionOptions) {
    super(params);
    this.streaming = new MockStreaming(this);
  }

  streaming: MockStreaming;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  retrieve<T>(ids: string | string[]): T {
    return build<T>("OpportunitySObject");
  }
}

export async function connect(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  credentials: Credentials
): Promise<MockConnection> {
  return new MockConnection({});
}
