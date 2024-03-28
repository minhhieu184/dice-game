import { luaScripts } from '@common'
import { AxiosModule } from '@config/axios/axios.module'
import {
  EnvironmentModule,
  EnvironmentService,
  envSchema
} from '@config/environment'
import { getEnvPath } from '@config/environment/envPath'
import { LockModule } from '@config/lock'
import { AutoPlayModule } from '@gateway/auto-play/auto-play.gateway.module'
import { ChatGatewayModule } from '@gateway/chat/chat.gateway.module'
import { AccountModule } from '@model/account/account.module'
import { ChatModule } from '@model/chat/chat.module'
import { GameModule } from '@model/game/game.module'
import { RoomModule } from '@model/room/room.module'
import { SequenceModule } from '@model/sequence/sequence.module'
import { DefaultTokenModule, TokenModule } from '@model/token/token.module'
import { UserModule } from '@model/user/user.module'
import { RedisModule } from '@nestjs-modules/ioredis'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_PIPE } from '@nestjs/core'
import { JwtModule } from '@nestjs/jwt'
import { MongooseModule } from '@nestjs/mongoose'
import { ThrottlerModule } from '@nestjs/throttler'
import { ZodValidationPipe } from 'nestjs-zod'
import { BaseGatewayModule } from 'src/gateway/base/base.gateway.module'
import { GameGatewayModule } from 'src/gateway/game/game.gateway.module'
import { RoomGatewayModule } from 'src/gateway/room/room.gateway.module'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { ReloadModule } from './reload.module'

@Module({
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe
    }
  ],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: getEnvPath(process.env.NODE_ENV),
      cache: true,
      expandVariables: true,
      validate: (config) => envSchema.parse(config)
    }),
    MongooseModule.forRootAsync({
      imports: [EnvironmentModule],
      useFactory: async (environmentService: EnvironmentService) => ({
        uri: environmentService.get('DATABASE_URI'),
        dbName: environmentService.get('DATABASE_INIT')
      }),
      inject: [EnvironmentService]
    }),
    JwtModule.registerAsync({
      global: true,
      imports: [EnvironmentModule],
      useFactory: async (environmentService: EnvironmentService) => ({
        secret: environmentService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: environmentService.get('JWT_EXPIRES_IN')
        }
      }),
      inject: [EnvironmentService]
    }),
    RedisModule.forRootAsync({
      imports: [EnvironmentModule],
      useFactory: async (environmentService: EnvironmentService) => ({
        config: {
          url: environmentService.get('REDIS_URI'),
          enableAutoPipelining: true,
          scripts: luaScripts
        }
      }),
      inject: [EnvironmentService]
    }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    ReloadModule,
    EnvironmentModule,
    LockModule,
    AxiosModule,
    /** Model */
    UserModule,
    AccountModule,
    RoomModule,
    TokenModule,
    DefaultTokenModule,
    GameModule,
    ChatModule,
    SequenceModule,
    /** Gateway */
    BaseGatewayModule,
    RoomGatewayModule,
    GameGatewayModule,
    AutoPlayModule,
    ChatGatewayModule
  ]
})
export class AppModule {}
