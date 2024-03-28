import { createZodDto } from 'nestjs-zod'
import { z } from 'nestjs-zod/z'

const PlayerDefaultSchema = z.object({
  defaultBet: z.coerce.number().positive().int()
})

export class PlayerDefaultDto extends createZodDto(PlayerDefaultSchema) {}
