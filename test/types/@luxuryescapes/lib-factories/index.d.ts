declare module "@luxuryescapes/lib-factories" {
  interface Helpers {
    counter: () => number;
    uuid: () => string;
  }

  export function define(
    name: string,
    builder: (helpers: Helpers) => object
  ): void;

  export function build<T>(name: string, attributes?: object): T;
}
