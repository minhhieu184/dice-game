import { UseGuards } from '@nestjs/common'
import { AuthenticationGuard } from './authentication.guard'
import { SocketAuthenticationGuard } from './socket-auth.guard'

export const Auth = UseGuards(AuthenticationGuard)
export const SocketAuth = UseGuards(SocketAuthenticationGuard)
