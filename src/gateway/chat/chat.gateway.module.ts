import { RoomGatewayModule } from '@gateway/room/room.gateway.module'
import { ChatModule } from '@model/chat/chat.module'
import { Module } from '@nestjs/common'
import { ChatGateway } from './chat.gateway'

@Module({
  providers: [ChatGateway],
  imports: [ChatModule, RoomGatewayModule],
  exports: []
})
export class ChatGatewayModule {}
