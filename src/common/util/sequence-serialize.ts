import { Chat } from '@model/chat/entities'
import { Sequence, SequenceBase } from '@model/sequence'
import { Document, FlatRecord, Model } from 'mongoose'

export const sequenceSerialize = async function (
  this: Document<unknown, object, FlatRecord<SequenceBase>> & FlatRecord<Chat>,
  sequenceModel: Model<Sequence>,
  name: string
) {
  if (this.isNew) {
    const { seq } = await sequenceModel.findOneAndUpdate(
      { name },
      { $inc: { seq: 1 } },
      { upsert: true, new: true }
    )
    this.seq = seq
  }
}
