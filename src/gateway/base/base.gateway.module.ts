import { RoomGatewayModule } from '@gateway/room/room.gateway.module'
import { RoomModule } from '@model/room/room.module'
import { UserModule } from '@model/user/user.module'
import { Global, Module } from '@nestjs/common'
import { BaseGateway } from './base.gateway'
import { BaseGatewayService } from './base.gateway.service'

@Global()
@Module({
  providers: [BaseGateway, BaseGatewayService],
  imports: [RoomModule, UserModule, RoomGatewayModule],
  exports: [BaseGatewayService]
})
export class BaseGatewayModule {}
