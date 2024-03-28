import {
  AsyncLockErrorFilter,
  GlobalFilter,
  HTTPExceptionFilter,
  ZodValidationExceptionFilter
} from '@common/filter'
import { INestApplication } from '@nestjs/common'
import { HttpAdapterHost } from '@nestjs/core'

export const applyGlobalFilter = (app: INestApplication) => {
  const httpAdapterHost = app.get(HttpAdapterHost)
  app.useGlobalFilters(
    new GlobalFilter(httpAdapterHost),
    new AsyncLockErrorFilter(httpAdapterHost),
    new HTTPExceptionFilter(httpAdapterHost),
    new ZodValidationExceptionFilter(httpAdapterHost)
  )
}
