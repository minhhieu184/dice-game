import {
  defaultBetLockKey,
  InjectRedis,
  roomName,
  Socket,
  SocketEmitEvent,
  userKey,
  WSException
} from '@common'
import { LockService } from '@config/lock'
import { BaseGatewayService, socketOption } from '@gateway/base'
import { Injectable } from '@nestjs/common'
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { Redis } from 'ioredis'
import { Server } from 'socket.io'
import { PlayerDefaultDto } from '../dto'
import { FreeUserGatewayService } from './free-user.gateway.service'

@Injectable()
@WebSocketGateway(socketOption)
export class PlayerDefaultBetGatewayService {
  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly lockService: LockService,
    private readonly baseGatewayService: BaseGatewayService,
    private readonly freeUserGatewayService: FreeUserGatewayService
  ) {}

  @WebSocketServer() private readonly io: Server

  async playerDefaultBet(client: Socket, { defaultBet }: PlayerDefaultDto) {
    const userId = client.data._id
    //* Check user in room
    const isFreeSimple = await this.freeUserGatewayService.isFreeSimple(userId)
    if (isFreeSimple.isFree) throw new WSException('User not in room')
    const roomId = isFreeSimple.roomId
    const balance = await this.redis.hget(userKey(userId), 'balance')
    const minBet = await this.redis.hget(roomName(roomId), 'minBet')
    if (!minBet) throw new WSException('Room does not have min bet')
    if (defaultBet < +minBet)
      throw new WSException("Player's default bet must be greater than min bet")
    if (!balance) throw new WSException('User does not have balance')
    if (defaultBet * 1.5 > +balance)
      throw new WSException("Player's default bet must be less than 1.5 * balance")

    await this.lockService.acquire(defaultBetLockKey(userId), async (done) => {
      done(null, this.redis.hset(userKey(userId), { defaultBet }))
    })

    await this.baseGatewayService.emitRoomData(
      roomId,
      SocketEmitEvent.PLAYER_DEFAULT_BET
    )
  }
}
