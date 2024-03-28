import { AccountModule } from '@model/account/account.module'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { RoomName, RoomSchema } from './entities/room.entity'
import { RoomController } from './room.controller'
import { RoomRepository } from './room.repository'
import { RoomService } from './room.service'

@Module({
  controllers: [RoomController],
  providers: [RoomService, RoomRepository],
  imports: [
    MongooseModule.forFeature([{ name: RoomName, schema: RoomSchema }]),
    AccountModule
  ],
  exports: [RoomService]
})
export class RoomModule {}
