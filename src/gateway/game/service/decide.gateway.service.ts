import {
  InjectRedis,
  newGameLockKey,
  roomKey,
  roomLockKey,
  roomName,
  roomPendingName,
  RoomStatus,
  SocketEmitEvent,
  userKey
} from '@common'
import { LockService } from '@config/lock'
import { BaseGatewayService, socketOption } from '@gateway/base'
import { WriteGame } from '@model/game/entities'
import { GameService } from '@model/game/game.service'
import { Injectable } from '@nestjs/common'
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import Redis from 'ioredis'
import { Server } from 'socket.io'
import { PlayerDecideArgs } from '../interface'
import { GameGatewayService } from './game.gateway.service'
import { ResultWaiting } from './result-waiting.service'
import { ResultGatewayService } from './result.gateway.service'

@Injectable()
@WebSocketGateway(socketOption)
export class DecideGatewayService extends ResultWaiting {
  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly lockService: LockService,
    private readonly gameService: GameService,
    private readonly baseGatewayService: BaseGatewayService,
    private readonly gameGatewayService: GameGatewayService,
    private readonly resultGatewayService: ResultGatewayService
  ) {
    super()
  }

  @WebSocketServer() private readonly io: Server

  decideCountdown(roomId: string, gameId: string) {
    return this.gameGatewayService.countdown({
      event: SocketEmitEvent.DECIDE_COUNTDOWN,
      roomId,
      seconds: 10,
      endCallback: () => this._endDecideCountdown(roomId, gameId)
    })
  }

  async playerDecide({ client, roomId, decide }: PlayerDecideArgs) {
    const userId = client.data._id

    //* Update decide
    await this.redis.hset(userKey(userId), { decide })
    //* Emit decide to room
    await this.baseGatewayService.emitRoomData(roomId, SocketEmitEvent.DECIDE)
  }

  private async _endDecideCountdown(roomId: string, gameId: string) {
    const { game, playerDiceNum } = await this.lockService.acquire<{
      game: Partial<WriteGame> & { profit: number }
      playerDiceNum: number
    }>(roomLockKey(roomId), async (done) => {
      const currentGameId = await this.redis.hget(roomKey(roomId), 'gameId')
      if (currentGameId !== gameId) return done()

      //* Update room status
      await this.redis.hset(roomKey(roomId), { status: RoomStatus.RESULT })

      const { playerResult, playerDiceNum, game } =
        await this.resultGatewayService.endDecideResult(roomId)

      //* Emit result to players
      this.io
        .to(roomName(roomId))
        .to(roomPendingName(roomId))
        .emit(SocketEmitEvent.RESULT, playerResult)

      await this.gameGatewayService.resetRoomData(roomId)
      done(null, { game, playerDiceNum })
    })
    await this.lockService.acquire<void>(newGameLockKey(roomId), async (done) => {
      //* Save game
      await this.gameService.update(gameId, game)
      //* New game
      const waitingTime = this.waitingTime(playerDiceNum)
      await new Promise((resolve) => setTimeout(resolve, waitingTime))
      await this.gameGatewayService.newGame(roomId)
      done()
    })
  }
}
