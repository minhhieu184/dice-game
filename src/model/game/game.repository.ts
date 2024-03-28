import { BaseRepository } from '@model/base'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Game, GameName, WriteGame } from './entities'

@Injectable()
export class GameRepository extends BaseRepository<Game, WriteGame> {
  constructor(@InjectModel(GameName) roomModel: Model<Game>) {
    super(roomModel)
  }
}
