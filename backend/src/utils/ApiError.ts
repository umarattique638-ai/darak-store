/** Operational error with an HTTP status — thrown from services, rendered by the error handler. */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code: string = "ERROR",
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }

  static badRequest(message = "Bad request", details?: unknown) {
    return new ApiError(400, message, "BAD_REQUEST", details);
  }
  static unauthorized(message = "Authentication required") {
    return new ApiError(401, message, "UNAUTHORIZED");
  }
  static forbidden(message = "You do not have permission to do this") {
    return new ApiError(403, message, "FORBIDDEN");
  }
  static notFound(message = "Not found") {
    return new ApiError(404, message, "NOT_FOUND");
  }
  static conflict(message = "Already exists") {
    return new ApiError(409, message, "CONFLICT");
  }
  static unavailable(message = "Service unavailable") {
    return new ApiError(503, message, "UNAVAILABLE");
  }
  static tooMany(message = "Too many requests, please try again later") {
    return new ApiError(429, message, "RATE_LIMITED");
  }
}
