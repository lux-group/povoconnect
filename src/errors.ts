export class FindAllTimeOutError extends Error {
  constructor(timeout: number) {
    super(`Bulk query timeout after ${timeout}ms`);
  }
}

export class TopicCompileError extends Error {
  constructor(message: string) {
    super(`Topic compile failure: ${message}`);
  }
}

export class TopicExceptionError extends Error {
  constructor(message: string) {
    super(`Topic exception: ${message}`);
  }
}
