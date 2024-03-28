import { trimString } from '@common'
import { createZodDto } from 'nestjs-zod'
import { z } from 'nestjs-zod/z'

const RoomSchema = z.object({
  minBet: z.coerce.number().min(100),
  name: z.preprocess(trimString, z.coerce.string().min(1).max(20)),
  inviteCode: z.preprocess(trimString, z.coerce.string().length(6).optional()),
  password: z.preprocess(trimString, z.coerce.string().min(1).max(20).optional()),
  countdown: z.coerce.number().min(10).max(120)
})

export class CreateRoomDto extends createZodDto(RoomSchema) {}
