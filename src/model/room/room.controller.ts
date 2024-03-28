import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common'
import { FindAllRoomQueryDto } from './dto'
import { RoomService } from './room.service'

@Controller('room')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Get()
  findAll(@Query() findAllRoomQueryDto: FindAllRoomQueryDto) {
    return this.roomService.findAllRoom(findAllRoomQueryDto)
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const room = await this.roomService.findById(id)
    if (!room) throw new NotFoundException('Room not found')
    if (room.expiredAt && room.expiredAt.getTime() < Date.now())
      throw new NotFoundException('Room is expired')
    return room.toObject()
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateRoomDto: UpdateRoomDto) {
  //   return this.roomService.update(+id, updateRoomDto)
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.roomService.remove(+id)
  // }
}
