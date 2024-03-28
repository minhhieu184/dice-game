import { WriteObjectId, WriteType } from '@common'
import { User } from '@model/user/entities/user.entity'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

@Schema()
export class RoomPlayer {
  @Prop({
    type: String,
    ref: User.name,
    path: 'uuid',
    required: true
  })
  userId: string
  @Prop({ type: String, required: true })
  name: string
  @Prop({ type: String })
  avatar?: string | null
  // player money
}
export const RoomPlayerSchema = SchemaFactory.createForClass(RoomPlayer)

export type WriteRoomPlayer = WriteType<RoomPlayer, { userId: WriteObjectId }>
