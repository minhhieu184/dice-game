import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

const SetBetSchema = z.object({
  bet: z.coerce.number().min(0)
})

export class SetBetDto extends createZodDto(SetBetSchema) {}
