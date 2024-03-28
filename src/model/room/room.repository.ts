import { EnvironmentService } from '@config/environment'
import { BaseRepository } from '@model/base'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { IRoomMethods, Room, RoomName, WriteRoom } from './entities/room.entity'

@Injectable()
export class RoomRepository extends BaseRepository<
  Room,
  WriteRoom,
  object,
  IRoomMethods
> {
  constructor(
    @InjectModel(RoomName)
    private readonly roomModel: Model<Room, object, IRoomMethods>,
    private readonly environmentService: EnvironmentService
  ) {
    super(roomModel)
  }

  reloadHandle() {
    return this.roomModel.updateMany(
      { expiredAt: { $exists: false } },
      {
        expiredAt: new Date(
          Date.now() + this.environmentService.get('ROOM_EXPIRE_MILLISECONDS')
        ),
        current_player_in_room: 0
      }
    )
  }
}
