import { UseFilters } from '@nestjs/common'
import { WSGlobalExceptionFilter } from './globalWS.filter'
import { WSAsyncLockErrorFilter } from './wsAsyncLockError.filter'
import { WSExceptionFilter } from './wsException.filter'
import { WsThrottlerExceptionFilter } from './wsThrottlerException.filter'
import { WSZodValidationExceptionFilter } from './wsZodValidationException.filter'

export const WSFilter = () =>
  UseFilters(
    WSGlobalExceptionFilter,
    WSAsyncLockErrorFilter,
    WSExceptionFilter,
    WsThrottlerExceptionFilter,
    WSZodValidationExceptionFilter
  )
