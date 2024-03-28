import {
  InjectRedis,
  roomKey,
  Socket,
  SocketEmitEvent,
  SocketSubscribeEvent,
  userKey,
  WSException,
  WSFilter,
  ZodPipe
} from '@common'
import { BaseGatewayService, socketOption } from '@gateway/base'
import { FreeUserGatewayService } from '@gateway/room/service'
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets'
import { Redis } from 'ioredis'
import { Server } from 'socket.io'
import { AutoPlayDto } from './dto'

@WebSocketGateway(socketOption)
@WSFilter()
export class AutoPlayGateway {
  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly baseGatewayService: BaseGatewayService,
    private readonly freeUserGatewayService: FreeUserGatewayService
  ) {}

  @WebSocketServer() io: Server

  @SubscribeMessage(SocketSubscribeEvent.AUTO_PLAY)
  async autoPlay(
    @MessageBody(ZodPipe(AutoPlayDto)) autoPlayDto: AutoPlayDto,
    @ConnectedSocket() client: Socket
  ) {
    const userId = client.data._id
    //* Check user in room
    const isFreeSimple = await this.freeUserGatewayService.isFreeSimple(userId)
    if (isFreeSimple.isFree) throw new WSException('User not in room')
    const roomId = isFreeSimple.roomId

    if (autoPlayDto.isAutoPlay) {
      //* Clear timer auto play bet
      const timer = await this.redis.hget(roomKey(roomId), 'autoPlayBetTimer')
      if (timer) {
        clearTimeout(timer)
        await this.redis.hdel(roomKey(roomId), 'autoPlayBetTimer')
      }
    }

    await this.redis.hset(userKey(userId), autoPlayDto)
    await this.baseGatewayService.emitRoomData(roomId, SocketEmitEvent.AUTO_PLAY)
  }
}
