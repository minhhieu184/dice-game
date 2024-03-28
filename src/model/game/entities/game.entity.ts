import { WriteObjectId, WriteType } from '@common'
import { BaseEntity } from '@model/base'
import { RoomName } from '@model/room/entities/room.entity'
import { User } from '@model/user/entities/user.entity'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { Types } from 'mongoose'
import { GamePlayer, GamePlayerSchema } from './game-player.entity'

@Schema({ timestamps: { createdAt: 'startedAt', updatedAt: true } })
export class Game extends BaseEntity {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: RoomName, required: true })
  roomId: Types.ObjectId
  @Prop({ type: String, ref: User.name, path: 'uuid', required: true })
  host: string
  @Prop({ type: Number })
  bet?: number | null
  @Prop({ type: Boolean })
  isDraw?: boolean | null
  @Prop({ type: Number })
  profit?: number | null
  @Prop({ type: [GamePlayerSchema], required: true })
  players: GamePlayer[]
}

export const GameSchema = SchemaFactory.createForClass(Game)
export type WriteGame = WriteType<
  Game,
  { roomId: WriteObjectId; players?: GamePlayer[] }
>
export const GameName = 'Game-Simple'
