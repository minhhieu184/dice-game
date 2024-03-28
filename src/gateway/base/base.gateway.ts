import {
  CreateUserRedis,
  InjectRedis,
  roomName,
  roomPendingName,
  Socket,
  userKey,
  userRoomName
} from '@common'
import { LeaveRoomGatewayService } from '@gateway/room/service'
import { UserService } from '@model/user/user.service'
import { JwtService } from '@nestjs/jwt'
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { Redis } from 'ioredis'
import { DisconnectReason, Server } from 'socket.io'
import { MiddlewareError, WSNextFunction } from './interface'
import { socketOption } from './socket-option'

@WebSocketGateway(socketOption)
export class BaseGateway {
  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly leaveRoomGatewayService: LeaveRoomGatewayService
  ) {}

  @WebSocketServer() io: Server

  onModuleInit() {
    /** Events */
    this.io.on('connection', this._onConnection.bind(this))

    /** Middleware */
    this.io.use(this._middleware.bind(this))

    /** Test */
    const token = this.jwtService.sign({
      _id: '8275170d-8c3d-4687-b687-11f63a14a23a'
    })
    console.log('const token1 =', token)
    const token2 = this.jwtService.sign({
      _id: '8275170d-8c3d-4687-b687-11f63a14a23b'
    })
    console.log('const token2 =', token2)
    const token3 = this.jwtService.sign({
      _id: '8275170d-8c3d-4687-b687-11f63a14a23c'
    })
    console.log('const token3 =', token3)
  }

  private async _middleware(client: Socket, next: WSNextFunction) {
    console.log('middleware ...')
    const err = new MiddlewareError('Unauthorized')

    const token = client.handshake.auth.token
    if (!token) {
      err.data = { reason: 'Missing token' }
      return next(err)
    }

    try {
      const { _id } = this.jwtService.verify<{ _id: string }>(token)

      //* Get user data
      const user = await this.userService.findById(_id)
      if (!user) {
        err.data = { reason: 'User not found' }
        return next(err)
      }

      //* Join to user room and save user data to socket
      client.join(userRoomName(_id))
      client.data = { ...user.toObject(), _id }
      return next()
    } catch (error) {
      console.log('AuthenticationGuard ~ error: 📕📕📕', error)
      err.data = { reason: 'Verify fail' }
      return next(err)
    }
  }

  private async _onConnection(client: Socket) {
    console.log('socket connected 💚💚💚')
    const { _id, user_name, created_at } = client.data
    console.log('BaseGateway ~ _onConnection ~ user_name:', user_name)

    //* Check user exist in redis
    const exist = await this.redis.exists(userKey(_id))

    const disconnectTimer = await this.redis.hget(userKey(_id), 'disconnectTimer')
    if (disconnectTimer) {
      clearTimeout(disconnectTimer)
      await this.redis.hdel(userKey(_id), 'disconnectTimer')
    }

    if (exist === 0) {
      const userRedisData: CreateUserRedis = {
        _id,
        roomId: '',
        seat: 0,
        defaultBet: -1,
        decide: false,
        name: user_name,
        createdAt: created_at.toLocaleDateString(),
        balance: -1,
        totalBet: -1,
        totalBetSimple: -1,
        isAutoPlay: false,
        autoPlayBet: 0,
        autoPlayBetInPercent: 0,
        autoPlayHostBet: 0,
        autoPlayHostBetInPercent: 0
      }
      await this.redis.hset(userKey(_id), userRedisData)
    } else {
      // !Nếu trong redis có lưu roomId của player này, tức là player này đang
      // ! chơi ở 1 room nào đó, thì join vào room đó
      // TODO: Cách check này có đảm bảo hay không vì có thể có trường hợp data
      // TODO: lưu trong redis thì không có roomId, nhưng các socket khác của
      // TODO: player này thì đang join vào 1 room nào đó
      const roomId = await this.redis.hget(userKey(_id), 'roomId')
      console.log('BaseGateway ~ _onConnection ~ roomId:', roomId)
      if (roomId) {
        const isPending = await this.redis.hget(userKey(_id), 'isPending')
        if (isPending) client.join(roomPendingName(roomId))
        else client.join(roomName(roomId))
      }
    }

    /** Events */
    client.on('disconnecting', this._onDisconnecting.bind(this, client))
    client.on('disconnect', this._onDisconnect.bind(this, client))
  }

  private async _onDisconnecting(
    client: Socket,
    reason: DisconnectReason,
    description?: any
  ) {
    console.log(client.rooms)
    console.log(client.data)

    const userId = client.data._id
    const userSocketNum = (await this.io.to(userRoomName(userId)).fetchSockets())
      .length
    if (userSocketNum < 2) {
      const disconnectTimer = setTimeout(async () => {
        try {
          await this.leaveRoomGatewayService.leaveRoom(userId)
          //* Delete user data in redis
          await this.redis.del(userKey(userId))
        } catch (error) {
          console.log('BaseGateway ~ setTimeout ~ error:', error)
        }
      }, 30000)
      await this.redis.hset(userKey(userId), { disconnectTimer })
    }

    console.log('BaseGateway ~ userSocketRoom:', userSocketNum)
    console.log('_onDisconnecting 💢💢 ~ reason:', reason)
    console.log('_onDisconnecting 💢💢 ~ description:', description)
  }

  private async _onDisconnect(
    client: Socket,
    reason: DisconnectReason,
    description?: any
  ) {
    console.log(client.rooms)
    console.log(client.data)
    const userId = client.data._id
    const userSocketRoom = (await this.io.to(userRoomName(userId)).fetchSockets())
      .length
    console.log('BaseGateway ~ userSocketRoom 2:', userSocketRoom)
    console.log('_onDisconnect 💢💢💢💢 ~ reason:', reason)
    console.log('_onDisconnect 💢💢💢💢 ~ description:', description)
  }
}
