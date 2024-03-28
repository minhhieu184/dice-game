import {
  CreateRoomRedis,
  InjectRedis,
  roomKey,
  roomName,
  roomPlayerKey,
  RoomStatus,
  UpdateUserRedis,
  userKey,
  userRoomName,
  WSException
} from '@common'
import { BaseGatewayService, socketOption } from '@gateway/base'
import { AccountService } from '@model/account/account.service'
import { CreateRoomDto } from '@model/room/dto'
import { RoomService } from '@model/room/room.service'
import { DefaultTokenModule } from '@model/token/token.module'
import { Injectable } from '@nestjs/common'
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { Redis } from 'ioredis'
import { Server } from 'socket.io'
import { FreeUserGatewayService } from './free-user.gateway.service'
import { ValidateAccountService } from './validateAccount.service'

@Injectable()
@WebSocketGateway(socketOption)
export class CreateRoomGatewayService extends ValidateAccountService {
  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly baseGatewayService: BaseGatewayService,
    protected readonly accountService: AccountService,
    private readonly roomService: RoomService,
    private readonly freeUserGatewayService: FreeUserGatewayService
  ) {
    super(accountService)
  }

  @WebSocketServer() private readonly io: Server

  async createRoom(userId: string, payload: CreateRoomDto) {
    const { isFree } = await this.freeUserGatewayService.isFree(userId)
    if (!isFree) throw new WSException('User already in room')

    //* Validate user account
    const account = await this.validateAccount(userId, payload.minBet)

    //* Create room in DB
    const room = await this.roomService.create({
      ...payload,
      creatorId: userId,
      host: { userId, name: 'test' },
      token: DefaultTokenModule.DEFAULT_TOKEN,
      current_player_in_room: 1
    })
    console.log('RoomGateway ~ handleMessage ~ _id:', room._id)

    const roomId = room._id.toString()
    await this._updateData(userId, roomId, account, payload)

    //* Make user join room
    this.io.in(userRoomName(userId)).socketsJoin(roomName(roomId))

    //* Create return data
    return await this.baseGatewayService.roomResponseData(roomId)
  }

  private _updateData(
    userId: string,
    roomId: string,
    account: Awaited<ReturnType<typeof this.validateAccount>>,
    payload: CreateRoomDto
  ) {
    const { balance, totalBetSimple, total_bet } = account
    //* Create room, add to room player list, update user roomId in redis
    const { inviteCode, ...rest } = payload
    const roomRedisData = {
      _id: roomId,
      ...rest,
      tokenId: DefaultTokenModule.DEFAULT_TOKEN._id.toString(),
      creatorId: userId,
      host: userId,
      status: RoomStatus.WAITING
    } satisfies CreateRoomRedis
    const updateUserRedis = {
      roomId,
      seat: 1,
      balance,
      totalBet: total_bet,
      totalBetSimple,
      defaultBet: payload.minBet
    } satisfies UpdateUserRedis
    return this.redis
      .multi()
      .hset(roomKey(roomId), roomRedisData)
      .hset(roomPlayerKey(roomId), '1', userId)
      .hset(userKey(userId), updateUserRedis)
      .exec()
  }
}
