import { trimString } from '@common'
import { createZodDto } from 'nestjs-zod'
import { z } from 'nestjs-zod/z'

const JoinRoomSchema = z.object({
  roomId: z.preprocess(trimString, z.coerce.string().length(24)),
  password: z.preprocess(trimString, z.coerce.string().optional())
})

export class JoinRoomDto extends createZodDto(JoinRoomSchema) {}
