import { RoomGatewayModule } from '@gateway/room/room.gateway.module'
import { AccountModule } from '@model/account/account.module'
import { GameModule } from '@model/game/game.module'
import { forwardRef, Module } from '@nestjs/common'
import { GameGateway } from './game.gateway'
import {
  BetGatewayService,
  DecideGatewayService,
  GameGatewayService,
  ResultGatewayService
} from './service'

@Module({
  providers: [
    GameGateway,
    GameGatewayService,
    BetGatewayService,
    DecideGatewayService,
    ResultGatewayService
  ],
  imports: [AccountModule, GameModule, forwardRef(() => RoomGatewayModule)],
  exports: [GameGatewayService, BetGatewayService]
})
export class GameGatewayModule {}
