import { InjectRedis, roomKey, RoomStatus, userKey } from '@common'
import { EnvironmentService } from '@config/environment'
import { RoomModule } from '@model/room/room.module'
import { RoomService } from '@model/room/room.service'
import { Module } from '@nestjs/common'
import { Redis } from 'ioredis'

@Module({ imports: [RoomModule] })
export class ReloadModule {
  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly roomService: RoomService,
    private readonly environmentService: EnvironmentService
  ) {}

  async onModuleInit() {
    try {
      //* Reset redis data
      const reloadRedis = this.redis.multi()

      const roomKeys = await this.redis.keys(roomKey('*'))
      // const roomPlayerKeys = await this.redis.keys(roomPlayerKey('*'))
      const userKeys = await this.redis.keys(userKey('*'))

      roomKeys.forEach((roomKey) => {
        if (roomKey.includes(':player')) reloadRedis.del(roomKey)
        else
          reloadRedis
            .expire(
              roomKey,
              this.environmentService.get('ROOM_EXPIRE_MILLISECONDS') / 1000,
              'NX'
            )
            .hdel(roomKey, 'bet')
            .hdel(roomKey, 'betTimer')
            .hdel(roomKey, 'decideTimer')
            .hset(roomKey, { status: RoomStatus.WAITING })
      })

      userKeys.forEach((userKey) => {
        reloadRedis
          .hdel(userKey, 'isPending')
          .hdel(userKey, 'disconnectTimer')
          .hset(userKey, { decide: false, roomId: '' })
      })

      //* Reset db room data
      const reloadRoom = this.roomService.reloadHandle()

      await Promise.all([reloadRedis.exec(), reloadRoom])
    } catch (error) {
      console.log('ReloadModule ~ onModuleInit ~ error:', error)
    }
  }
}
