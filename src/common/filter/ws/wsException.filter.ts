import { SocketEmitEvent } from '@common/constant'
import { WSException } from '@common/exception'
import { ArgumentsHost, Catch, HttpStatus, WsExceptionFilter } from '@nestjs/common'

@Catch(WSException)
export class WSExceptionFilter implements WsExceptionFilter<WSException> {
  catch(e: WSException, host: ArgumentsHost) {
    console.log('WS EXCEPTION FILTER📕📕📕', e)
    const socket = host.switchToWs().getClient()
    socket.emit(SocketEmitEvent.SOCKET_ERROR, {
      status: HttpStatus.BAD_REQUEST,
      user: socket.data._id,
      socketID: socket.id,
      message: e.message
    })
  }
}
