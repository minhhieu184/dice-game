import { BaseService } from '@model/base'
import { Injectable } from '@nestjs/common'
import { Token, WriteToken } from './token.entity'
import { TokenRepository } from './token.repository'

@Injectable()
export class TokenService extends BaseService<Token, WriteToken> {
  constructor(readonly tokenRepository: TokenRepository) {
    super(tokenRepository)
  }
}
