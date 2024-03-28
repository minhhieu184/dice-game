import {
  decideLockKey,
  InjectRedis,
  roomKey,
  roomLockKey,
  RoomRedis,
  RoomStatus,
  Socket,
  SocketSubscribeEvent,
  startGameLockKey,
  userKey,
  UserRedis,
  WSException,
  WSFilter,
  ZodPipe
} from '@common'
import { LockService } from '@config/lock'
import { RoomResponseData, socketOption } from '@gateway/base'
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
import { DecideDto, SetBetDto } from './dto'
import { BetGatewayService, DecideGatewayService } from './service'

@WebSocketGateway(socketOption)
@WSFilter()
export class GameGateway {
  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly lockService: LockService,
    private readonly betGatewayService: BetGatewayService,
    private readonly decideGatewayService: DecideGatewayService,
    private readonly freeUserGatewayService: FreeUserGatewayService
  ) {}

  @WebSocketServer() io: Server

  @SubscribeMessage(SocketSubscribeEvent.START_GAME)
  async startGame(
    @MessageBody() _payload: undefined,
    @ConnectedSocket() client: Socket
  ) {
    const userId = client.data._id

    //* Check user in room and isPending
    const isFreeSimple = await this.freeUserGatewayService.isFreeSimple(userId)
    if (isFreeSimple.isFree) throw new WSException('User not in room')
    const roomId = isFreeSimple.roomId
    const isPending = await this.redis.hget(userKey(userId), 'isPending')
    if (isPending !== null) throw new WSException('User is pending')
    //* Check room status
    const curRoomStatus = await this.redis.hget(roomKey(roomId), 'status')
    if (curRoomStatus !== RoomStatus.WAITING)
      throw new WSException('Room is not waiting for player to start game')
    //* Lock room start game
    const isLock = this.lockService.isBusy(startGameLockKey(roomId))
    if (isLock) throw new WSException('Room is starting game')
    return await this.lockService.acquire<Promise<RoomResponseData>>(
      [startGameLockKey(roomId), roomLockKey(roomId)],
      (done) => done(null, this.betGatewayService.startGame(roomId))
    )
  }

  @SubscribeMessage(SocketSubscribeEvent.SET_BET)
  async setBet(
    @MessageBody(ZodPipe(SetBetDto)) { bet }: SetBetDto,
    @ConnectedSocket() client: Socket
  ) {
    const userId = client.data._id
    const isAutoPlay = await this.redis.hget(userKey(userId), 'isAutoPlay')
    if (isAutoPlay === 'true') throw new WSException('User is auto play')
    await this.betGatewayService.setBet({ bet, userId })
  }

  @SubscribeMessage(SocketSubscribeEvent.DECIDE)
  async playerDecide(
    @MessageBody(ZodPipe(DecideDto)) { decide }: DecideDto,
    @ConnectedSocket() client: Socket
  ) {
    const userId = client.data._id
    const isAutoPlay = await this.redis.hget(userKey(userId), 'isAutoPlay')
    if (isAutoPlay === 'true') throw new WSException('User is auto play')

    //* Check user in room
    const user = (await this.redis.hgetall(userKey(userId))) as UserRedis
    const roomId = user.roomId
    if (!roomId) throw new WSException('User not in room')
    if (user.isPending !== undefined) throw new WSException('User is pending')
    //* Check room status and is host
    const room = (await this.redis.hgetall(roomKey(roomId))) as RoomRedis
    if (room.status !== RoomStatus.DECIDING)
      throw new WSException('You cannot decide now')
    if (room.host === userId)
      throw new WSException('You cannot decide cause you are host')
    //* Check user account
    if (!user.balance) throw new WSException('User balance not found')
    if (!room.bet) throw new WSException('Room bet not found')
    if (+user.balance < +room.bet * 1.5)
      throw new WSException('Your balance not enough')
    //* Lock user decide
    await this.lockService.acquire(decideLockKey(userId), (done) => {
      done(null, this.decideGatewayService.playerDecide({ client, roomId, decide }))
    })
  }
}
