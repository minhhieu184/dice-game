import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Sequence, SequenceSchema } from './entity/sequence.entity'

@Module({
  controllers: [],
  providers: [],
  imports: [
    MongooseModule.forFeature([{ name: Sequence.name, schema: SequenceSchema }])
  ],
  exports: []
})
export class SequenceModule {}
