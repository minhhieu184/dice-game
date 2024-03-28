import { WriteObjectId, WriteType } from '@common'
import { Token } from '@model/token/token.entity'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { Types } from 'mongoose'

@Schema()
export class UserDepositHistory {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Token.name })
  token: Types.ObjectId
  @Prop({ type: Number, required: true, min: 0 })
  amount: number
  @Prop({ type: Date, required: true })
  depositAt: Date
  @Prop({ type: String, required: true })
  transactionHash: string
  @Prop({ type: Number, required: true })
  chainId: number
}
export const UserDepositHistorySchema =
  SchemaFactory.createForClass(UserDepositHistory)
export type WriteUserDepositHistory = WriteType<
  UserDepositHistory,
  { token: WriteObjectId }
>
