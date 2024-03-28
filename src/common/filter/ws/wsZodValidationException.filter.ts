import { SocketEmitEvent } from '@common/constant'
import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common'
import { ZodValidationException } from 'nestjs-zod'

@Catch(ZodValidationException)
export class WSZodValidationExceptionFilter
  implements ExceptionFilter<ZodValidationException>
{
  catch(e: ZodValidationException, host: ArgumentsHost): void {
    console.log('WS ZOD VALIDATION FILTER📕📕📕 ', e)
    const socket = host.switchToWs().getClient()
    socket.emit(SocketEmitEvent.SOCKET_ERROR, {
      status: HttpStatus.BAD_REQUEST,
      user: socket.data._id,
      socketID: socket.id,
      message: JSON.parse(e.getZodError().message)
    })
  }
}
