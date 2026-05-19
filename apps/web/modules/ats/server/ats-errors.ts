export class AtsAnalysisError extends Error {
  constructor(
    message: string,
    public readonly statusCode = 500,
  ) {
    super(message);
    this.name = "AtsAnalysisError";
  }
}
