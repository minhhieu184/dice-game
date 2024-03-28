import { Global, Logger, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { TokenController } from './token.controller'
import { Token, TokenSchema } from './token.entity'
import { TokenRepository } from './token.repository'
import { TokenService } from './token.service'

@Module({
  controllers: [TokenController],
  providers: [TokenService, TokenRepository],
  imports: [MongooseModule.forFeature([{ name: Token.name, schema: TokenSchema }])],
  exports: [TokenService]
})
export class TokenModule {}

const DEFAULT_TOKEN_NAME = 'TYEN'

@Global()
@Module({
  providers: [],
  imports: [TokenModule],
  exports: []
})
export class DefaultTokenModule {
  static DEFAULT_TOKEN: Token

  constructor(private readonly tokenService: TokenService) {}

  async onModuleInit() {
    const logger = new Logger(DefaultTokenModule.name)
    const defaultToken = await this.tokenService.tokenRepository.findTokensByName(
      DEFAULT_TOKEN_NAME
    )
    if (!defaultToken) {
      logger.error('TYEN token not found')
      throw new Error('Default token not found')
    }
    DefaultTokenModule.DEFAULT_TOKEN = defaultToken
  }
}
