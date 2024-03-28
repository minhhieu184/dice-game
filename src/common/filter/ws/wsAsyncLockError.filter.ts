import { SocketEmitEvent } from '@common/constant'
import { AsyncLockError } from '@common/exception'
import { ArgumentsHost, Catch, HttpStatus, WsExceptionFilter } from '@nestjs/common'

@Catch(AsyncLockError)
export class WSAsyncLockErrorFilter implements WsExceptionFilter<AsyncLockError> {
  catch(e: AsyncLockError, host: ArgumentsHost) {
    console.log('WS ASYNC LOCK ERROR FILTER📕📕📕', e)
    const socket = host.switchToWs().getClient()
    socket.emit(SocketEmitEvent.SOCKET_ERROR, {
      status: HttpStatus.BAD_REQUEST,
      user: socket.data._id,
      socketID: socket.id,
      message: e.message
    })
  }
}
