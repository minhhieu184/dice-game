import { Socket } from '@common/interface'
import { ExecutionContext, Injectable } from '@nestjs/common'
import {
  ThrottlerException,
  ThrottlerGuard,
  ThrottlerOptions
} from '@nestjs/throttler'

@Injectable()
export class WsThrottlerGuard extends ThrottlerGuard {
  async handleRequest(
    context: ExecutionContext,
    limit: number,
    ttl: number,
    throttler: ThrottlerOptions
  ): Promise<boolean> {
    const client = context.switchToWs().getClient<Socket>()
    const ip = client.handshake.address
    const key = this.generateKey(context, ip, throttler.name || 'default')
    const { totalHits } = await this.storageService.increment(key, ttl)

    if (totalHits > limit) throw new ThrottlerException()
    return true
  }
}
