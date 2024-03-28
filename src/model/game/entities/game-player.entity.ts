import { ResultType } from '@common'
import { User } from '@model/user/entities/user.entity'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

@Schema()
export class GamePlayer {
  @Prop({ type: String, required: true, ref: User.name, path: 'uuid' })
  userId: string
  @Prop({ type: Number, required: true })
  seat: number
  @Prop({ type: Number })
  dice?: number | null
  @Prop({ type: String, enum: ResultType })
  resultType?: ResultType | null
  @Prop({ type: Number })
  balanceChange?: number | null
}
export const GamePlayerSchema = SchemaFactory.createForClass(GamePlayer)

export type WriteGamePlayer = GamePlayer
