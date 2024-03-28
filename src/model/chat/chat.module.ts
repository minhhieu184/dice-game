import { sequenceSerialize } from '@common'
import { Sequence, SequenceSchema } from '@model/sequence'
import { Module } from '@nestjs/common'
import { getModelToken, MongooseModule } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { ChatController } from './chat.controller'
import { ChatRepository, IChatRepository } from './chat.repository'
import { ChatService, IChatService } from './chat.service'
import { Chat, ChatName, ChatSchema } from './entities'

@Module({
  controllers: [ChatController],
  providers: [
    {
      provide: IChatService,
      useClass: ChatService
    },
    {
      provide: IChatRepository,
      useClass: ChatRepository
    }
  ],
  imports: [
    MongooseModule.forFeatureAsync([
      { name: Sequence.name, useFactory: () => SequenceSchema },
      {
        name: ChatName,
        inject: [getModelToken(Sequence.name)],
        useFactory: (sequenceModel: Model<Sequence>) => {
          const schema = ChatSchema
          schema.pre('save', async function (next) {
            try {
              await sequenceSerialize.call(this, sequenceModel, Chat.name)
              return next()
            } catch (error: any) {
              next(error)
            }
          })
          return schema
        }
      }
    ])
  ],
  exports: [IChatService]
})
export class ChatModule {}
