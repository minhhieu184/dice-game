import { IS_PUBLIC_KEY } from '@common/decorator'
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { JwtService } from '@nestjs/jwt'
import { Request } from 'express'

@Injectable()
export class AuthenticationGuard implements CanActivate {
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

    const request = context.switchToHttp().getRequest()
    const token = this._extractTokenFromHeader(request)
    if (!token) throw new UnauthorizedException()

    try {
      const { _id } = await this.jwtService.verifyAsync<{ _id: string }>(token)
      console.log('AuthenticationGuard ~ _id:', _id)
      return true
    } catch (error) {
      console.log('AuthenticationGuard ~ error:', error)
      throw new UnauthorizedException()
    }
  }

  private _extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? []
    return type === 'Bearer' ? token : undefined
  }
}
