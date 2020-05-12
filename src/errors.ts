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
