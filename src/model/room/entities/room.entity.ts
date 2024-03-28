import { WriteObjectId, WriteType } from '@common'
import { BaseEntity } from '@model/base'
import { User } from '@model/user/entities/user.entity'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { RoomPlayer, WriteRoomPlayer } from './room-player.entity'
import { RoomToken, RoomTokenSchema, WriteRoomToken } from './room-token.entity'

@Schema({
  timestamps: { createdAt: true, updatedAt: true },
  toObject: {
    transform(doc, ret, options) {
      ret.is_private = !!ret.password
      delete ret.searchScore
      delete ret.password
      return ret
    }
  }
})
export class Room extends BaseEntity {
  @Prop({ type: String, ref: User.name, path: 'uuid', required: true })
  creatorId: string
  @Prop({ type: Number, required: true, min: 100, default: 100 })
  minBet: number
  @Prop({ type: String, required: true, minlength: 1, maxlength: 30 })
  name: string
  @Prop({ type: String, minlength: 6, maxlength: 6 })
  inviteCode?: string | null
  // @Prop({ type: [RoomChatSchema], required: true, default: [] })
  // chats: RoomChat[]
  // @Prop({ type: [RoomPlayerSchema], required: true })
  // players: RoomPlayer[]
  @Prop({ type: RoomPlayer, required: true })
  host: RoomPlayer
  @Prop({ type: Date })
  changeHostAt?: Date | null
  @Prop({ type: Number, required: true, default: 0 })
  jackpotAmount: number
  @Prop({ type: String })
  password?: string | null
  @Prop({ type: Number, required: true, default: 60, min: 10, max: 120 })
  countdown: number
  @Prop({ type: Boolean, required: true, default: true })
  isPlaying: boolean
  @Prop({ type: RoomTokenSchema, required: true })
  token: RoomToken
  @Prop({ type: Number, required: true, default: 0 })
  current_player_in_room: number
  @Prop({ type: Date })
  expiredAt?: Date | null
  // createdAt: Date
  // updatedAt: Date
}
export const RoomSchema = SchemaFactory.createForClass(Room)

/** Index */
RoomSchema.index({ name: 'text' })
RoomSchema.index({ name: 1 })
RoomSchema.index({ minBet: 1 })
RoomSchema.index({ current_player_in_room: 1 })

/** Method */
RoomSchema.methods.comparePassword = async function (
  this: Room,
  candidatePassword: string | undefined
): Promise<boolean> {
  return true
  // if (!candidatePassword && !this.password) return true
  // if (candidatePassword && this.password) {
  //   return compare(candidatePassword, this.password)
  // }
  // return false
}

export interface IRoomMethods {
  comparePassword(candidatePassword: string | undefined): Promise<boolean>
}

export type WriteRoom = WriteType<
  Room,
  {
    creatorId: WriteObjectId
    minBet?: number
    // players?: WriteRoomPlayer[]
    host: WriteRoomPlayer
    jackpotAmount?: number
    countdown?: number
    jackpotCountdown?: number
    isPlaying?: boolean | null
    token: WriteRoomToken
    current_player_in_room?: number
    createdAt?: Date
    updatedAt?: Date
  }
>

export const RoomName = 'Room-Simple'
