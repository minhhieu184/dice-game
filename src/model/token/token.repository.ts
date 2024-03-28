import { BaseRepository } from '@model/base'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Token, WriteToken } from './token.entity'

@Injectable()
export class TokenRepository extends BaseRepository<Token, WriteToken> {
  constructor(@InjectModel(Token.name) public tokenModel: Model<Token>) {
    super(tokenModel)
  }

  async findTokensByName(symbol: string) {
    return this.tokenModel.findOne({ symbol })
  }
}
