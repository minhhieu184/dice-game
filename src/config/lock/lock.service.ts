import { AsyncLockError } from '@common'
import { Injectable } from '@nestjs/common'
import AsyncLock from 'async-lock'

@Injectable()
export class LockService extends AsyncLock {
  constructor() {
    super({ timeout: 10000, maxExecutionTime: 35000 })
  }

  async acquire<T>(
    key: string | string[],
    fn: (done: AsyncLock.AsyncLockDoneCallback<T>) => any,
    opts?: AsyncLock.AsyncLockOptions | undefined
  ): Promise<T>
  async acquire<T>(
    key: string | string[],
    fn: (done: AsyncLock.AsyncLockDoneCallback<T>) => any,
    cb: AsyncLock.AsyncLockDoneCallback<T>,
    opts?: AsyncLock.AsyncLockOptions | undefined
  ): Promise<void>
  async acquire<T>(
    key: string | string[],
    fn: (done: AsyncLock.AsyncLockDoneCallback<T>) => any,
    cb?: unknown,
    opts?: unknown
  ): Promise<void | T> {
    try {
      return await super.acquire<T>(
        key,
        async (done) => {
          try {
            await fn(done)
          } catch (error: any) {
            done(error)
          }
        },
        cb as any,
        opts as any
      )
    } catch (error: any) {
      if (error.name === 'Error') throw new AsyncLockError(error)
      else throw error
    }
  }
}
