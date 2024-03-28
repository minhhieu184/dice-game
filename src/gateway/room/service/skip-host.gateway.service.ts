import {
  InjectRedis,
  newGameLockKey,
  roomKey,
  roomLockKey,
  RoomStatus,
  skipHostLockKey,
  SocketEmitEvent,
  WSException
} from '@common'
import { LockService } from '@config/lock'
import { BaseGatewayService, socketOption } from '@gateway/base'
import { GameGatewayService, ResultWaiting } from '@gateway/game/service'
import { forwardRef, Inject, Injectable } from '@nestjs/common'
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import Redis from 'ioredis'
import { Server } from 'socket.io'
import { FreeUserGatewayService } from './free-user.gateway.service'

@Injectable()
@WebSocketGateway(socketOption)
export class SkipHostGatewayService extends ResultWaiting {
  constructor(
    @InjectRedis() private readonly redis: Redis,
    protected readonly lockService: LockService,
    protected readonly baseGatewayService: BaseGatewayService,
    @Inject(forwardRef(() => GameGatewayService))
    protected readonly gameGatewayService: GameGatewayService,
    private readonly freeUserGatewayService: FreeUserGatewayService
  ) {
    super()
  }

  @WebSocketServer() private readonly io: Server

  async skipHost(userId: string) {
    //* Check user in room
    const isFreeSimple = await this.freeUserGatewayService.isFreeSimple(userId)
    if (isFreeSimple.isFree) throw new WSException('User not in room')
    const roomId = isFreeSimple.roomId
    //* Check isHost
    const [host, roomStatus, gameId] = await this.redis.hmget(
      roomKey(roomId),
      'host',
      'status',
      'gameId'
    )
    if (host !== userId) throw new WSException('User is not host')
    //* Check room status
    if (roomStatus !== RoomStatus.WAITING && roomStatus !== RoomStatus.BETTING)
      throw new WSException('You only can skip host in waiting or betting')
    //* Check gameId
    if (!gameId) throw new WSException('Room does not have game')
    //* Check skip host lock
    const skipHostLockBusy = this.lockService.isBusy(skipHostLockKey(roomId))
    if (skipHostLockBusy) throw new WSException('You are skipping host')

    //* Lock room
    await this.lockService.acquire(
      skipHostLockKey(roomId),
      async (skipHostLockDone) => {
        await this.lockService.acquire(
          roomLockKey(roomId),
          async (roomLockDone) => {
            //* Check current gameId
            const currentGameId = await this.redis.hget(roomKey(roomId), 'gameId')
            if (currentGameId !== gameId) return roomLockDone()
            //* Clear data
            if (roomStatus === RoomStatus.WAITING) {
              await this.redis.nextHost(roomId)
              await this.baseGatewayService.emitRoomData(
                roomId,
                SocketEmitEvent.SKIP_HOST
              )
            } else if (roomStatus === RoomStatus.BETTING) {
              await this.gameGatewayService.clearRoomTimer(roomId)
              await this.gameGatewayService.resetRoomData(roomId)
              await this.baseGatewayService.emitRoomData(
                roomId,
                SocketEmitEvent.SKIP_HOST
              )
            }
            roomLockDone()
            //* New game
            const waitingTime = this.waitingTime(0)
            await new Promise((resolve) => setTimeout(resolve, waitingTime))
            const isNewGameLock = this.lockService.isBusy(newGameLockKey(roomId))
            if (!isNewGameLock && roomStatus === RoomStatus.BETTING)
              await this.gameGatewayService.newGame(roomId)

            skipHostLockDone()
          }
        )
      }
    )
  }
}
