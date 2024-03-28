import {
  InjectRedis,
  roomName,
  roomPendingName,
  Socket,
  SocketEmitEvent,
  SocketSubscribeEvent,
  userKey,
  WSException,
  WSFilter,
  ZodPipe
} from '@common'
import { socketOption } from '@gateway/base'
import { FreeUserGatewayService } from '@gateway/room/service'
import { IChatService, InjectChatService } from '@model/chat/chat.service'
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets'
import { Redis } from 'ioredis'
import { Server } from 'socket.io'
import { CreateChatDto } from './dto/create-chat.dto'

@WebSocketGateway(socketOption)
@WSFilter()
export class ChatGateway {
  constructor(
    @InjectRedis() private readonly redis: Redis,
    @InjectChatService() private readonly chatService: IChatService,
    private readonly freeUserGatewayService: FreeUserGatewayService
  ) {}

  @WebSocketServer() io: Server

  @SubscribeMessage(SocketSubscribeEvent.SEND_MESSAGE)
  async chatMessage(
    @MessageBody(ZodPipe(CreateChatDto)) { message }: CreateChatDto,
    @ConnectedSocket() client: Socket
  ) {
    const userId = client.data._id
    //* Check user in room
    const isFreeSimple = await this.freeUserGatewayService.isFreeSimple(userId)
    if (isFreeSimple.isFree) throw new WSException('User not in room')
    const roomId = isFreeSimple.roomId
    const name = await this.redis.hget(userKey(userId), 'name')
    const chatData = { message, userId, roomId, userName: name || undefined }
    //* Emit message
    this.io
      .to(roomName(roomId))
      .except(roomPendingName(roomId))
      .emit(SocketEmitEvent.SEND_MESSAGE, chatData)
    //* Create chat
    await this.chatService.create(chatData)
  }
}
