import { BaseEntity } from '@model/base'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

@Schema()
export class Sequence extends BaseEntity {
  @Prop({ type: String, required: true })
  name: string
  @Prop({ type: Number, required: true })
  seq: number
}
export const SequenceSchema = SchemaFactory.createForClass(Sequence)
