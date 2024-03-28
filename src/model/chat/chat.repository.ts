import { BaseRepository } from '@model/base'
import { Inject, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { FilterQuery, Model } from 'mongoose'
import { FindAllChatWithSeqQueryDto } from './dto'
import { Chat, ChatName, WriteChat } from './entities'

export interface IChatRepository extends BaseRepository<Chat, WriteChat> {
  findAllWithSeq: (queryArgs: FindAllChatWithSeqQueryDto) => Promise<any>
}
export const IChatRepository = Symbol('IChatRepository')
export const InjectChatRepository = () => Inject(IChatRepository)

@Injectable()
export class ChatRepository
  extends BaseRepository<Chat, WriteChat>
  implements IChatRepository
{
  constructor(@InjectModel(ChatName) private readonly chatModel: Model<Chat>) {
    super(chatModel)
  }

  async findAllWithSeq(queryArgs: FindAllChatWithSeqQueryDto) {
    const { next, take = 10, fields, new: _new, ..._queryParams } = queryArgs
    const queryParams = _queryParams as FilterQuery<Chat>
    if (_new) {
      if (next !== undefined) queryParams.seq = { $lt: next }
    } else queryParams.seq = { $gt: next || 0 }
    const query = this.chatModel
      .find(_queryParams)
      .sort({ seq: _new ? -1 : 1 })
      .limit(take)
    /** Select */
    if (fields) {
      const select = fields.split(',').map((field) => field.trim())
      query.select(select)
    }
    const data = await query.exec()
    return {
      perPage: data.length,
      next: data[data.length - 1]?.seq || 0,
      data
    }
  }
}
