import { WriteObjectId, WriteType } from '@common'
import { RoomName } from '@model/room/entities/room.entity'
import { SequenceBase } from '@model/sequence'
import { User } from '@model/user/entities/user.entity'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { Types } from 'mongoose'

@Schema({ timestamps: { createdAt: 'sentAt' } })
export class Chat extends SequenceBase {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: RoomName, required: true })
  roomId: Types.ObjectId
  @Prop({ type: String, ref: User.name, path: 'uuid', required: true })
  userId: string
  @Prop({ type: String, required: true, default: 'Unknown' })
  userName: string
  @Prop({ type: String, required: true })
  message: string
}
export const ChatSchema = SchemaFactory.createForClass(Chat)

/** Index */
ChatSchema.index({ roomId: 1, seq: 1 })

export type WriteChat = WriteType<
  Chat,
  {
    seq?: number
    roomId: WriteObjectId
    userId: WriteObjectId
    userName?: string
  }
>

export const ChatName = 'Chat-Simple'
