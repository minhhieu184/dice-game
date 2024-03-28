import { GameGatewayModule } from '@gateway/game/game.gateway.module'
import { AccountModule } from '@model/account/account.module'
import { RoomModule } from '@model/room/room.module'
import { forwardRef, Module } from '@nestjs/common'
import { RoomGateway } from './room.gateway'
import {
  CreateRoomGatewayService,
  FreeUserGatewayService,
  JoinRoomGatewayService,
  LeaveRoomGatewayService,
  PlayerDefaultBetGatewayService,
  SkipGameGatewayService,
  SkipHostGatewayService
} from './service'

@Module({
  providers: [
    RoomGateway,
    CreateRoomGatewayService,
    JoinRoomGatewayService,
    PlayerDefaultBetGatewayService,
    LeaveRoomGatewayService,
    SkipGameGatewayService,
    SkipHostGatewayService,
    FreeUserGatewayService
  ],
  imports: [RoomModule, AccountModule, forwardRef(() => GameGatewayModule)],
  exports: [LeaveRoomGatewayService, FreeUserGatewayService]
})
export class RoomGatewayModule {}
