import {
  joinRoomLockKey,
  Socket,
  SocketSubscribeEvent,
  WSFilter,
  WsThrottlerGuard,
  ZodPipe
} from '@common'
import { LockService } from '@config/lock'
import { RoomResponseData, socketOption } from '@gateway/base'
import { CreateRoomDto } from '@model/room/dto'
import { UseGuards } from '@nestjs/common'
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets'
import { Server } from 'socket.io'
import { JoinRoomDto, PlayerDefaultDto } from './dto'
import {
  CreateRoomGatewayService,
  JoinRoomGatewayService,
  LeaveRoomGatewayService,
  PlayerDefaultBetGatewayService,
  SkipGameGatewayService,
  SkipHostGatewayService
} from './service'

@UseGuards(WsThrottlerGuard)
@WebSocketGateway(socketOption)
@WSFilter()
export class RoomGateway {
  constructor(
    private readonly lockService: LockService,
    private readonly createRoomGatewayService: CreateRoomGatewayService,
    private readonly joinRoomGatewayService: JoinRoomGatewayService,
    private readonly playerDefaultBetGatewayService: PlayerDefaultBetGatewayService,
    private readonly leaveRoomGatewayService: LeaveRoomGatewayService,
    private readonly skipGameGatewayService: SkipGameGatewayService,
    private readonly skipHostGatewayService: SkipHostGatewayService
  ) {}

  @WebSocketServer() io: Server

  @SubscribeMessage(SocketSubscribeEvent.CREATE_ROOM)
  async createRoom(
    @MessageBody(ZodPipe(CreateRoomDto)) data: CreateRoomDto,
    @ConnectedSocket() client: Socket
  ) {
    const userId = client.data._id
    console.log('RoomGateway ~ userId:', userId)
    return await this.lockService.acquire(joinRoomLockKey(userId), async (done) =>
      done(null, await this.createRoomGatewayService.createRoom(userId, data))
    )
  }

  @SubscribeMessage(SocketSubscribeEvent.JOIN_ROOM)
  async joinRoom(
    @MessageBody(ZodPipe(JoinRoomDto)) joinRoomDto: JoinRoomDto,
    @ConnectedSocket() client: Socket
  ) {
    const userId = client.data._id
    console.log('RoomGateway ~ userId:', userId)
    return await this.lockService.acquire(joinRoomLockKey(userId), async (done) =>
      done(null, await this.joinRoomGatewayService.joinRoom(userId, joinRoomDto))
    )
  }

  @SubscribeMessage(SocketSubscribeEvent.JOIN_RANDOM)
  async joinRandom(
    @MessageBody() _payload: undefined,
    @ConnectedSocket() client: Socket
  ) {
    const userId = client.data._id
    console.log('RoomGateway ~ userId:', userId)
    return await this.lockService.acquire<Promise<RoomResponseData>>(
      joinRoomLockKey(userId),
      (done) => done(null, this.joinRoomGatewayService.joinRandomRoom(userId))
    )
  }

  @SubscribeMessage(SocketSubscribeEvent.PLAYER_DEFAULT_BET)
  async playerDefaultBet(
    @MessageBody(ZodPipe(PlayerDefaultDto)) playerDefaultDto: PlayerDefaultDto,
    @ConnectedSocket() client: Socket
  ) {
    await this.playerDefaultBetGatewayService.playerDefaultBet(
      client,
      playerDefaultDto
    )
  }

  @SubscribeMessage(SocketSubscribeEvent.LEAVE_ROOM)
  async leaveRoom(
    @MessageBody() _payload: undefined,
    @ConnectedSocket() client: Socket
  ) {
    const userId = client.data._id
    await this.leaveRoomGatewayService.leaveRoom(userId, 'Leave room by self')
  }

  @SubscribeMessage(SocketSubscribeEvent.SKIP_GAME)
  async skipGame(
    @MessageBody() _payload: undefined,
    @ConnectedSocket() client: Socket
  ) {
    const userId = client.data._id
    await this.skipGameGatewayService.skipGame(userId)
  }

  @SubscribeMessage(SocketSubscribeEvent.SKIP_HOST)
  async skipHost(
    @MessageBody() _payload: undefined,
    @ConnectedSocket() client: Socket
  ) {
    const userId = client.data._id
    await this.skipHostGatewayService.skipHost(userId)
  }
}
