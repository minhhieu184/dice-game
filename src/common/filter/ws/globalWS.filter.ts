import { SocketEmitEvent } from '@common/constant'
import { ArgumentsHost, Catch, HttpStatus, WsExceptionFilter } from '@nestjs/common'

@Catch()
export class WSGlobalExceptionFilter implements WsExceptionFilter<Error> {
  catch(e: Error, host: ArgumentsHost) {
    console.log('WS GLOBAL FILTER📕📕📕', e)
    const socket = host.switchToWs().getClient()
    socket.emit(SocketEmitEvent.SOCKET_ERROR, {
      status: HttpStatus.BAD_REQUEST,
      user: socket.data._id,
      socketID: socket.id,
      message: e.message
    })
  }
}
