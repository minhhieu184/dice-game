export class MiddlewareError extends Error {
  constructor(msg: string) {
    super(msg)

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, MiddlewareError.prototype)
  }
  data?: any
}

export type WSNextFunction = (err?: MiddlewareError) => void
