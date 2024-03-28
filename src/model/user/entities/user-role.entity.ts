import { BaseEntity } from '@model/base'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

export type UserRoleDocument = HydratedDocument<UserRole>

export enum USER_ROLE {
  ADMIN = 'Admin',
  USER = 'User'
}

@Schema({
  collection: 'user-roles',
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
})
export class UserRole extends BaseEntity {
  @Prop({
    unique: true,
    default: USER_ROLE.USER,
    enum: USER_ROLE,
    required: true
  })
  name: string

  @Prop()
  _description: string
}

export const UserRoleSchema = SchemaFactory.createForClass(UserRole)
