import { InjectRedis } from '@common'
import { FreeUserGatewayService } from '@gateway/room/service'
import { Controller, Get, Param } from '@nestjs/common'
import { Redis } from 'ioredis'
import { UserService } from './user.service'

@Controller('user')
export class UserController {
  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly userService: UserService,
    private readonly freeUserGatewayService: FreeUserGatewayService
  ) {}

  // @Post()
  // create(@Body() createUserDto: CreateUserDto) {
  //   return this.userService.create(createUserDto)
  // }

  // @Get()
  // findAll() {
  //   return this.userService.findAll()
  // }

  @Get(':id/free')
  findOne(@Param('id') id: string) {
    return this.freeUserGatewayService.isFreeSimple(id)
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
  //   return this.userService.update(+id, updateUserDto)
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.userService.remove(+id)
  // }
}
