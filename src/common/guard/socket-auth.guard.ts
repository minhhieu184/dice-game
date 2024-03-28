import { IS_PUBLIC_KEY } from '@common/decorator'
import { WSException } from '@common/exception'
import { Socket } from '@common/interface'
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class SocketAuthenticationGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.get<boolean>(
      IS_PUBLIC_KEY,
      context.getHandler()
    )
    if (isPublic) return true

    const client = context.switchToWs().getClient<Socket>()
    const token = this._extractTokenFromHeader(client)
    if (!token) throw new WSException('Unauthorized')

    try {
      const { _id } = await this.jwtService.verifyAsync<{ _id: string }>(token)
      console.log('AuthenticationGuard ~ _id:', _id)
      return true
    } catch (error) {
      console.log('AuthenticationGuard ~ error:', error)
      throw new WSException('Unauthorized')
    }
  }

  private _extractTokenFromHeader(client: Socket): string | undefined {
    return client.handshake.auth.token
  }
}
