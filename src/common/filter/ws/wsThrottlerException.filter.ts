import { SocketEmitEvent } from '@common/constant'
import { ArgumentsHost, Catch, HttpStatus, WsExceptionFilter } from '@nestjs/common'
import { ThrottlerException } from '@nestjs/throttler'

@Catch(ThrottlerException)
export class WsThrottlerExceptionFilter
  implements WsExceptionFilter<ThrottlerException>
{
  catch(e: ThrottlerException, host: ArgumentsHost) {
    console.log('WS THROTTLER EXCEPTION FILTER📕📕📕', e)
    const socket = host.switchToWs().getClient()
    socket.emit(SocketEmitEvent.SOCKET_ERROR, {
      status: HttpStatus.TOO_MANY_REQUESTS,
      user: socket.data._id,
      socketID: socket.id,
      message: e.message
    })
  }
}
