import {
  InjectRedis,
  roomKey,
  roomName,
  roomPendingName,
  roomPlayerKey,
  RoomRedis,
  RoomStatus,
  SocketEmitEvent,
  UpdateUserRedis,
  userKey,
  userRoomName,
  WSException
} from '@common'
import { BaseGatewayService, socketOption } from '@gateway/base'
import { AccountService } from '@model/account/account.service'
import { RoomService } from '@model/room/room.service'
import { Injectable } from '@nestjs/common'
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import Redis from 'ioredis'
import { Server } from 'socket.io'
import { JoinRoomDto } from '../dto'
import { FreeUserGatewayService } from './free-user.gateway.service'
import { ValidateAccountService } from './validateAccount.service'

@Injectable()
@WebSocketGateway(socketOption)
export class JoinRoomGatewayService extends ValidateAccountService {
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

  async joinRoom(userId: string, { roomId, password }: JoinRoomDto) {
    //* Room data in redis
    const room = (await this.redis.hgetall(roomKey(roomId))) as RoomRedis
    if (!room._id) throw new WSException('Room not found')

    //* Check user in room
    const { isFree, roomId: curRoomId } = await this.freeUserGatewayService.isFree(
      userId
    )
    console.log('JoinRoomGatewayService ~ joinRoom ~ curRoomId:', curRoomId)
    console.log('JoinRoomGatewayService ~ joinRoom ~ isFree:', isFree)
    if (!isFree && !curRoomId) throw new WSException('User already in room')
    if (curRoomId) {
      if (curRoomId !== roomId) throw new WSException('User already in room')
      else return await this.baseGatewayService.roomResponseData(roomId)
    }

    //* Check room password and expired
    const roomDb = await this.roomService.findById(roomId)
    if (!roomDb) throw new WSException('Room not found')
    if (roomDb.expiredAt && roomDb.expiredAt.getTime() < Date.now())
      throw new WSException('Room is expired')
    const isValidPassword = password === roomDb.password
    if (!isValidPassword) throw new WSException('Wrong password')
    //* Validate user account
    const account = await this.validateAccount(userId, +room.minBet)
    //* Check is empty room
    const isEmptyRoom = (await this.redis.hlen(roomPlayerKey(roomId))) === 0
    //* Check seat
    const seat = await this.redis.setSeat(roomPlayerKey(roomId), userId)
    console.log('RoomGateway ~ seat:', seat)
    if (!seat) throw new WSException('Room is full')
    //* Remove room expired
    await this.redis.persist(roomKey(roomId))
    await this.roomService.update(roomId, { $unset: { expiredAt: '' } })
    //* Set host
    if (seat === 1 && isEmptyRoom) this.redis.hset(roomKey(roomId), 'host', userId)
    //* Update room player count
    const playerCount = await this.redis.hlen(roomPlayerKey(roomId))
    this.roomService.update(roomId, { current_player_in_room: playerCount })
    //* Join room
    if (room.status === RoomStatus.WAITING) {
      this.io.in(userRoomName(userId)).socketsJoin(roomName(roomId))
    } else {
      this.io.in(userRoomName(userId)).socketsJoin(roomPendingName(roomId))
      await this.redis.hset(userKey(userId), 'isPending', 'true')
    }

    const updateUserRedis = {
      roomId,
      defaultBet: +room.minBet,
      balance: account.balance,
      totalBet: account.total_bet,
      totalBetSimple: account.totalBetSimple,
      seat
    } satisfies UpdateUserRedis
    await this.redis.hset(userKey(userId), updateUserRedis)

    //* Notify other players
    const userInfo = await this.redis.hgetall(userKey(userId))
    const roomInfo = await this.baseGatewayService.roomResponseData(roomId)
    if (!curRoomId) {
      this.io
        .to(roomName(roomId))
        .except(userRoomName(userId))
        .emit(SocketEmitEvent.PLAYER_JOIN, {
          room: roomInfo,
          joinPlayer: userInfo
        })
    }

    return roomInfo
  }

  async joinRandomRoom(userId: string) {
    const randRoom = await this.roomService.joinRandomRoom(userId)
    return await this.joinRoom(userId, { roomId: randRoom._id.toString() })
  }
}
