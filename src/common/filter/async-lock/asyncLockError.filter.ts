import { AsyncLockError } from '@common/exception'
import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common'
import { HttpAdapterHost } from '@nestjs/core'

@Catch(AsyncLockError)
export class AsyncLockErrorFilter implements ExceptionFilter<AsyncLockError> {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(e: AsyncLockError, host: ArgumentsHost): void {
    console.log('ASYNC LOCK ERROR FILTER📕📕📕', e)
    const { httpAdapter } = this.httpAdapterHost

    const ctx = host.switchToHttp()
    const path = httpAdapter.getRequestUrl(ctx.getRequest())
    const timestamp = new Date().toISOString()
    const statusCode = HttpStatus.BAD_REQUEST

    httpAdapter.reply(
      ctx.getResponse(),
      { message: e.message, statusCode, timestamp, path },
      statusCode
    )
  }
}
