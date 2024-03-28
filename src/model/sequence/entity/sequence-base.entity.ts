import { BaseEntity } from '@model/base'
import { Prop } from '@nestjs/mongoose'

export class SequenceBase extends BaseEntity {
  @Prop({ type: Number })
  seq: number
}
