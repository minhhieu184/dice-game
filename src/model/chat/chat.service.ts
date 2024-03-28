import { BaseService } from '@model/base'
import { Inject, Injectable } from '@nestjs/common'
import { IChatRepository, InjectChatRepository } from './chat.repository'
import { FindAllChatWithSeqQueryDto } from './dto'
import { Chat, WriteChat } from './entities'

export interface IChatService extends BaseService<Chat, WriteChat> {
  findAllWithSeq: (queryArgs: FindAllChatWithSeqQueryDto) => Promise<any>
}

export const IChatService = Symbol('IChatService')
export const InjectChatService = () => Inject(IChatService)

@Injectable()
export class ChatService
  extends BaseService<Chat, WriteChat>
  implements IChatService
{
  constructor(
    @InjectChatRepository() private readonly chatRepository: IChatRepository
  ) {
    super(chatRepository)
  }

  findAllWithSeq(queryArgs: FindAllChatWithSeqQueryDto) {
    return this.chatRepository.findAllWithSeq(queryArgs)
  }
}
