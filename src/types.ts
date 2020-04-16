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

export interface Credentials {
  clientId: string;
  clientSecret: string;
  loginUrl: string;
  password: string;
  username: string;
}

export type ModelMappedCallback<M> = (model: M) => Promise<void>;

export type MessageReceiveCallback = (message: Message) => Promise<void>;

export type IdReceiveCallback = (id: string) => Promise<void>;

export type Fields = string[];

export interface Query {
  where?: string;
  limit?: number;
  fields: Fields;
}
