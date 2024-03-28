import { WriteType } from '@common'
import { BaseEntity } from '@model/base'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

@Schema({
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
  // toJSON: {
  //   transform: (doc, ret, options) => {
  //     delete ret.__v
  //     delete ret.created_at
  //     delete ret.updated_at
  //   }
  // }
})
export class _Token extends BaseEntity {
  @Prop({ type: String, required: true })
  symbol: string
  @Prop({ type: String, required: true })
  address: string
  @Prop({ type: String, required: true })
  network: string
  @Prop({ type: Number, required: true })
  chain_id: number
  @Prop({ type: Number, required: true })
  decimal: number
  @Prop({ type: Number })
  rate?: number | null
  @Prop({ type: Number, default: null })
  withdrawal_fee_rate: number | null
  @Prop({ type: Number, default: null })
  minimum_withdrawal_fee: number | null
  @Prop({ type: Boolean, required: true, default: false })
  is_test: boolean
  @Prop({ type: Boolean, required: true, default: false })
  is_lock: boolean
  @Prop({ type: String, default: null })
  symbol_image: string | null
  @Prop({ type: String, default: null })
  border_image: string | null
  @Prop({ type: String, default: null })
  partner_logo: string | null
  @Prop({ type: String, default: null })
  web_url: string | null
  @Prop({ type: Number, default: null })
  priority: number | null
}
export class Token extends _Token {
  @Prop({ type: String, required: true, unique: true })
  name: string
  @Prop({ type: String, required: true, unique: true })
  token_code_name: string
}
export const TokenSchema = SchemaFactory.createForClass(Token)
export type WriteToken = WriteType<
  Token,
  {
    withdrawal_fee_rate?: number | null
    minimum_withdrawal_fee?: number | null
    is_test?: boolean
    is_lock?: boolean
    symbol_image?: string | null
    partner_logo?: string | null
    web_url?: string | null
    priority?: number | null
  }
>
