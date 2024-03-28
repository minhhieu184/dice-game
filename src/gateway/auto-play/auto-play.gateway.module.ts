import { RoomGatewayModule } from '@gateway/room/room.gateway.module'
import { Module } from '@nestjs/common'
import { AutoPlayGateway } from './auto-play.gateway'

@Module({
  providers: [AutoPlayGateway],
  imports: [RoomGatewayModule]
})
export class AutoPlayModule {}
