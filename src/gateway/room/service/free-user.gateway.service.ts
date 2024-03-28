import { InjectRedis, userKey } from '@common'
import { AxiosService } from '@config/axios/axios.service'
import { EnvironmentService } from '@config/environment'
import { Injectable } from '@nestjs/common'
import { Redis } from 'ioredis'

@Injectable()
export class FreeUserGatewayService {
  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly axiosService: AxiosService,
    private readonly environmentService: EnvironmentService
  ) {}

  async isFree(userId: string): Promise<{ isFree: boolean; roomId?: string }> {
    const isFreeSimple = await this.isFreeSimple(userId)
    if (!isFreeSimple.isFree) return isFreeSimple
    return await this.isFreePro(userId)
  }

  async isFreeSimple(
    userId: string
  ): Promise<{ isFree: false; roomId: string } | { isFree: true }> {
    //* Is free in Tabsai Simple
    const currentRoomId = await this.redis.hget(userKey(userId), 'roomId')
    if (currentRoomId) return { isFree: false, roomId: currentRoomId }
    return { isFree: true }
  }

  async isFreePro(userId: string) {
    try {
      //* Is free in Tabsai Pro
      const { data } = await this.axiosService.axiosRef.get<{ isFree: boolean }>(
        `${this.environmentService.get(
          'TABSAI_PRO_URL'
        )}/room/check-user-free/${userId}`
      )
      return { isFree: data.isFree }
    } catch (error) {
      return { isFree: true }
    }
  }
}
