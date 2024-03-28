import { WriteObjectId, WriteType } from '@common'
import { BaseEntity } from '@model/base'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { Types } from 'mongoose'
import {
  UserDepositHistory,
  UserDepositHistorySchema
} from './user-deposit-histories.entity'

export enum Role {
  admin = 1,
  sub_admin
}
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
export class User extends BaseEntity {
  @Prop({ type: String, required: true })
  _id: Types.ObjectId
  @Prop({
    type: String,
    required: true,
    match: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/
  })
  email: string
  @Prop({ type: String, required: true })
  user_name: string
  @Prop({ type: String, required: true })
  password: string
  @Prop({ type: String })
  secret_key_2FA?: string | null
  @Prop({ type: Boolean, required: true, default: false })
  is_enable_2FA: boolean
  @Prop({ type: String })
  blockchain_address?: string | null
  @Prop({ type: String })
  blockchain_private_key?: string | null
  @Prop({ type: [UserDepositHistorySchema] })
  deposit_histories?: UserDepositHistory[] | null

  // withdraw_histories

  @Prop({ type: String })
  verify_token_withdraw?: string | null
  @Prop({ type: Boolean, required: true, default: false })
  is_withdrawing: boolean
  @Prop({ type: Date })
  send_verify_email_code_at?: Date | null
  @Prop({ type: String })
  verification_code?: string | null
  @Prop({ type: Date })
  verify_email_at?: Date | null
  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'Account' })
  accounts: Types.ObjectId[] | null
  @Prop({ type: Number, enum: Role })
  role?: Role

  @Prop({ type: String, maxlength: 6 })
  referrer_code?: string | null

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
  referrer_id?: string | null

  @Prop({ type: Boolean, required: true, default: true })
  is_enable_withdraw: boolean

  // missing dynamic_nft_id

  @Prop({ type: String, default: null })
  linked_address: string | null

  @Prop({ type: String, default: null })
  verify_token_mint_nft: string | null

  @Prop({ type: Date })
  send_email_mint_nft_at?: Date | null

  @Prop({ type: Boolean, required: true, default: false })
  is_disabled: boolean
  created_at: Date
}

export const UserSchema = SchemaFactory.createForClass(User)
export type WriteUser = WriteType<
  User,
  {
    _id: string
    is_enable_2FA?: boolean
    accounts?: WriteObjectId[] | null
    is_enable_withdraw?: boolean
    linked_address?: string | null
    verify_token_mint_nft?: string | null
    is_disabled?: boolean
  }
>
