import { BaseService } from '@model/base'
import { Injectable } from '@nestjs/common'
import { Game, WriteGame } from './entities'
import { GameRepository } from './game.repository'

@Injectable()
export class GameService extends BaseService<Game, WriteGame> {
  constructor(private readonly gameRepository: GameRepository) {
    super(gameRepository)
  }
}
