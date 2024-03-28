import { Prop } from '@nestjs/mongoose'
import { Types } from 'mongoose'

export class BaseEntity {
  _id: Types.ObjectId

  @Prop({ type: Date })
  deleted_at?: Date | null
}
