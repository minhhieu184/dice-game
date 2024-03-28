import {
  InjectRedis,
  roomKey,
  roomName,
  roomPlayerKey,
  RoomRedis,
  SocketEmitEvent,
  userKey,
  UserRedis
} from '@common'
import { Injectable } from '@nestjs/common'
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import Redis from 'ioredis'
import { Server } from 'socket.io'
import { RoomResponseData } from './interface'
import { socketOption } from './socket-option'

@Injectable()
@WebSocketGateway(socketOption)
export class BaseGatewayService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  @WebSocketServer() private readonly io: Server

  async roomResponseData(roomId: string): Promise<RoomResponseData> {
    //* Create return data
    const playerIds = await this.redis.hvals(roomPlayerKey(roomId))
    const players = await Promise.all(
      playerIds.map((id) => this.redis.hgetall(userKey(id)) as Promise<UserRedis>)
    )
    return {
      ...((await this.redis.hgetall(roomKey(roomId))) as RoomRedis),
      players
    }
  }

  async emitRoomData(roomId: string, event: SocketEmitEvent) {
    const roomData = await this.roomResponseData(roomId)
    this.io.to(roomName(roomId)).emit(event, roomData)
    return roomData
  }
}
