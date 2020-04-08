export class ListTimeOutError extends Error {
  constructor(timeout: number) {
    super(`Bulk query timeout after ${timeout}ms`);
  }
}
