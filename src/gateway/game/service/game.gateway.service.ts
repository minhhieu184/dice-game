import {
  InjectRedis,
  PLAYER_TO_START,
  roomKey,
  roomName,
  roomPendingName,
  roomPlayerKey,
  RoomStatus,
  SocketEmitEvent,
  userKey
} from '@common'
import { BaseGatewayService, socketOption } from '@gateway/base'
import { forwardRef, Inject, Injectable } from '@nestjs/common'
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { Redis } from 'ioredis'
import { Server } from 'socket.io'
import { CountdownArgs } from '../interface'
import { BetGatewayService } from './bet.gateway.service'

@Injectable()
@WebSocketGateway(socketOption)
export class GameGatewayService {
  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly baseGatewayService: BaseGatewayService,
    @Inject(forwardRef(() => BetGatewayService))
    private readonly betGatewayService: BetGatewayService
  ) {}

  @WebSocketServer() private readonly io: Server

  countdown({ event, roomId, seconds, endCallback }: CountdownArgs) {
    let count = seconds
    this.io.to(roomName(roomId)).to(roomPendingName(roomId)).emit(event, count)
    count--
    const timer = setInterval(async () => {
      try {
        this.io.to(roomName(roomId)).to(roomPendingName(roomId)).emit(event, count)
        count--
        if (count < 0) {
          clearInterval(timer)
          endCallback && (await endCallback())
        }
      } catch (error) {
        console.log('GameGatewayService ~ countdown ~ error:', error)
      }
    }, 1000)
    return timer
  }

  async resetRoomData(roomId: string) {
    const req = this.redis.multi()

    const players = await this.redis.hvals(roomPlayerKey(roomId))

    //* Move all socket pending to room
    this.io.to(roomPendingName(roomId)).socketsJoin(roomName(roomId))
    this.io.to(roomPendingName(roomId)).socketsLeave(roomPendingName(roomId))

    //* Delete LOCK, bet and betTimer; Set new host in room
    //* Delete LOCK, isPending; Set decide in user
    req
      .hdel(roomKey(roomId), 'bet')
      .hdel(roomKey(roomId), 'betTimer')
      .hdel(roomKey(roomId), 'decideTimer')
      .hdel(roomKey(roomId), 'autoPlayBetTimer')
      .hset(roomKey(roomId), { gameID: '' })

    players.forEach((id) => {
      req.hdel(userKey(id), 'isPending').hset(userKey(id), { decide: false })
    })

    await req.exec()
  }

  async newGame(roomId: string) {
    const players = await this.redis.hvals(roomPlayerKey(roomId))
    //* Handle new game
    if (players.length < PLAYER_TO_START) {
      await this.redis.hset(roomKey(roomId), { status: RoomStatus.WAITING })
      await this.baseGatewayService.emitRoomData(
        roomId,
        SocketEmitEvent.NOT_CONTINUE_GAME
      )
    } else {
      const roomStatus = await this.redis.hget(roomKey(roomId), 'status')
      if (roomStatus !== RoomStatus.WAITING) {
        await this.redis.nextHost(roomId)
        await this.resetRoomData(roomId)
        await this.betGatewayService.startGame(roomId)
      }
    }
  }

  async clearRoomTimer(roomId: string) {
    const timers = await this.redis.hmget(
      roomKey(roomId),
      'betTimer',
      'decideTimer',
      'autoPlayBetTimer'
    )
    timers.forEach((timer) => {
      if (timer) {
        clearInterval(Number(timer))
        clearTimeout(Number(timer))
      }
    })
  }
}
