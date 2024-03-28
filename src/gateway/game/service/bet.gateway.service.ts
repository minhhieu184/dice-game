import {
  InjectRedis,
  PLAYER_TO_START,
  roomKey,
  roomLockKey,
  roomName,
  roomPendingName,
  roomPlayerKey,
  RoomRedis,
  RoomStatus,
  SocketEmitEvent,
  userKey,
  UserRedis,
  WSException
} from '@common'
import { LockService } from '@config/lock'
import { BaseGatewayService, socketOption } from '@gateway/base'
import { GameService } from '@model/game/game.service'
import { Injectable } from '@nestjs/common'
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { Redis } from 'ioredis'
import { Server } from 'socket.io'
import { SetBetArgs, SetBetSuccessHandleArgs } from '../interface'
import { DecideGatewayService } from './decide.gateway.service'
import { GameGatewayService } from './game.gateway.service'

@Injectable()
@WebSocketGateway(socketOption)
export class BetGatewayService {
  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly lockService: LockService,
    private readonly gameService: GameService,
    private readonly baseGatewayService: BaseGatewayService,
    private readonly gameGatewayService: GameGatewayService,
    private readonly decideGatewayService: DecideGatewayService
  ) {}

  @WebSocketServer() private readonly io: Server

  async startGame(roomId: string) {
    const hostId = await this.redis.hget(roomKey(roomId), 'host')
    if (!hostId) throw new WSException('Room has no host')
    //* Check enough player
    const playerCount = await this.redis.hlen(roomPlayerKey(roomId))
    console.log('BetGatewayService ~ startGame ~ playerCount:', playerCount)
    if (playerCount < PLAYER_TO_START) {
      throw new WSException(
        `Room must have at least ${PLAYER_TO_START} players to start game`
      )
    }
    //* Change status
    await this.redis.hset(roomKey(roomId), { status: RoomStatus.BETTING })
    //* Notify to players
    const roomData = await this.baseGatewayService.emitRoomData(
      roomId,
      SocketEmitEvent.START_GAME
    )

    //* Create game data
    const { _id } = await this.gameService.create({ host: hostId, roomId })
    const gameId = _id.toString()
    await this.redis.hset(roomKey(roomId), { gameId })

    const host = (await this.redis.hgetall(userKey(hostId))) as UserRedis
    if (host.isAutoPlay === 'true') {
      //* Set bet for host
      let hostBet = +host.autoPlayHostBet
      if (+host.autoPlayHostBetInPercent) {
        hostBet = +host.balance * (+host.autoPlayHostBetInPercent / 100)
      }
      const timer = setTimeout(async () => {
        try {
          await this.setBet({ bet: hostBet, userId: hostId })
        } catch (error) {
          console.log('Autoplay Host set bet ~ error:', error)
        }
      }, (+roomData.countdown * 1000) / 2)
      await this.redis.hset(roomKey(roomId), { autoPlayBetTimer: timer })
    }

    //* Countdown
    const timer = this.gameGatewayService.countdown({
      event: SocketEmitEvent.BET_COUNTDOWN,
      roomId,
      seconds: +roomData.countdown,
      endCallback: () => this._endBetCountdown(roomId, gameId)
    })
    await this.redis.hset(roomKey(roomId), { betTimer: timer })

    return roomData
  }

  async setBet({ bet, userId }: SetBetArgs) {
    //* Check user in room
    const user = (await this.redis.hgetall(userKey(userId))) as UserRedis
    const roomId = user.roomId
    if (!roomId) throw new WSException('User not in room')
    if (user.isPending !== undefined) throw new WSException('User is pending')
    //* Check user balance
    if (bet > +user.balance * 1.5)
      throw new WSException('Your bet must be lower or equal 1.5x your balance')
    //* Check room status and is host
    const room = (await this.redis.hgetall(roomKey(roomId))) as RoomRedis
    if (room.status !== RoomStatus.BETTING)
      throw new WSException('You cannot set bet now')
    if (room.host !== userId) throw new WSException('You are not host')
    //* Check minBet
    if (!room.minBet) throw new WSException('Room minBet not found')
    if (bet < +room.minBet)
      throw new WSException('Your bet must be higher or equal min bet of room')
    //* Check gameId
    if (!room.gameId) throw new WSException('Room does not have game')

    //* Lock room
    await this.lockService.acquire<void>(roomLockKey(roomId), async (done) => {
      //* Check current gameId
      const currentGameId = await this.redis.hget(roomKey(roomId), 'gameId')
      if (currentGameId !== room.gameId) return done()

      //* Set bet
      const isSuccess = await this.redis.hsetnx(roomKey(roomId), 'bet', bet)
      console.log('GameGatewayService ~ setBet ~ isSuccess:', isSuccess)
      if (isSuccess === 0) throw new WSException('Bet already set')
      //* Clear timer
      room.betTimer && clearInterval(Number(room.betTimer))
      //* Set bet success handle
      this._setBetSuccessHandle({
        bet,
        gameId: currentGameId,
        hostId: room.host,
        roomId
      })
      done()
    })
  }

  private async _endBetCountdown(roomId: string, gameId: string) {
    await this.lockService.acquire<void>(roomLockKey(roomId), async (done) => {
      const currentGameId = await this.redis.hget(roomKey(roomId), 'gameId')
      if (currentGameId !== gameId) return done()

      const hostId = await this.redis.hget(roomKey(roomId), 'host')
      if (!hostId) return done()
      const defaultBet = await this.redis.hget(userKey(hostId), 'defaultBet')
      if (!defaultBet) return done()
      const isSuccess = await this.redis.hsetnx(roomKey(roomId), 'bet', defaultBet)
      if (isSuccess === 0) return done()

      //* Set bet success handle
      // await this._setBetSuccessHandle(roomId, hostId, +defaultBet)
      await this._setBetSuccessHandle({ bet: +defaultBet, gameId, hostId, roomId })
      done()
    })
  }

  private async _setBetSuccessHandle(args: SetBetSuccessHandleArgs) {
    const { bet, gameId, hostId, roomId } = args
    //* Change room status
    await this.redis.hset(roomKey(roomId), { status: RoomStatus.DECIDING })
    //* Update player decide depend on defaultBet
    const playerIds = await this.redis.hvals(roomPlayerKey(roomId))
    await Promise.all(
      playerIds.map(async (id) => {
        const user = (await this.redis.hgetall(userKey(id))) as UserRedis
        if (user.isPending !== undefined) return

        let decide = false
        if (user.defaultBet && +user.defaultBet >= bet) decide = true
        if (user.isAutoPlay === 'true') {
          let autoPlayBet = +user.autoPlayBet
          if (+user.autoPlayBetInPercent) {
            autoPlayBet = +user.balance * (+user.autoPlayBetInPercent / 100)
          }
          if (autoPlayBet >= bet && +user.balance >= 1.5 * bet) decide = true
          else decide = false
        }
        if (hostId === id) decide = true

        return this.redis.hset(userKey(id), { decide })
      })
    )

    // await this.baseGatewayService.emitRoomData(roomId, SocketEmitEvent.SET_BET)
    const roomData = await this.baseGatewayService.roomResponseData(roomId)
    this.io
      .to(roomName(roomId))
      .to(roomPendingName(roomId))
      .emit(SocketEmitEvent.SET_BET, roomData)
    //* Decide Countdown
    const timer = this.decideGatewayService.decideCountdown(roomId, gameId)
    await this.redis.hset(roomKey(roomId), { decideTimer: timer })
  }
}
