import { WriteObjectId, WriteType } from '@common'
import { User } from '@model/user/entities/user.entity'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { Types } from 'mongoose'

@Schema({ timestamps: { createdAt: true } })
export class RoomChat {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    required: true
  })
  userId: Types.ObjectId
  @Prop({ type: String, required: true })
  name: string
  @Prop({ type: String })
  avatar?: string | null
  @Prop({ type: String, required: true })
  message: string
}
export const RoomChatSchema = SchemaFactory.createForClass(RoomChat)
export type WriteRoomChat = WriteType<RoomChat, { userId: WriteObjectId }>
