import { WriteToken, _Token } from '@model/token/token.entity'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

@Schema()
export class RoomToken extends _Token {
  @Prop({ type: String, required: true })
  name: string
  @Prop({ type: String, required: true })
  token_code_name: string
}
export const RoomTokenSchema = SchemaFactory.createForClass(RoomToken)

export type WriteRoomToken = WriteToken
