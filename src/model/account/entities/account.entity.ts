import { WriteObjectId, WriteType } from '@common'
import { BaseEntity } from '@model/base'
import { Token } from '@model/token/token.entity'
import { User } from '@model/user/entities/user.entity'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { Types } from 'mongoose'

@Schema()
export class Account extends BaseEntity {
  @Prop({ type: String, ref: User.name, path: 'uuid' })
  user_id: string
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Token.name,
    required: true
  })
  token: Types.ObjectId
  @Prop({ type: Number, default: 0 })
  balance: number
  @Prop({ type: Number })
  minProfitSimple?: number | null
  @Prop({ type: Number })
  maxProfitSimple?: number | null
  @Prop({ type: Number })
  profitSimple?: number | null
  @Prop({ type: Number })
  gameCountSimple?: number | null
  @Prop({ type: Number, default: 0 })
  totalBetSimple: number
  @Prop({ type: Number, default: 0 })
  total_bet: number
  @Prop({ type: Number, default: 0 })
  allTotalBet: number
}
export const AccountSchema = SchemaFactory.createForClass(Account)

//* Index
AccountSchema.index({ allTotalBet: 1 })

export type WriteAccount = WriteType<
  Account,
  {
    balance?: number
    token: WriteObjectId
    total_bet?: number
  }
>
