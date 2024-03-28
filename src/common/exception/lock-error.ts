export class AsyncLockError extends Error {
  constructor(error: Error) {
    super(error.message)
    this.name = 'AsyncLockError'
    this.stack = error.stack
  }
}
