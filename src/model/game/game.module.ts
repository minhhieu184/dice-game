import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { GameName, GameSchema } from './entities'
import { GameController } from './game.controller'
import { GameRepository } from './game.repository'
import { GameService } from './game.service'

@Module({
  controllers: [GameController],
  providers: [GameService, GameRepository],
  imports: [MongooseModule.forFeature([{ name: GameName, schema: GameSchema }])],
  exports: [GameService]
})
export class GameModule {}
