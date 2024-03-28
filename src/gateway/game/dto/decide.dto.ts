import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

const DecideSchema = z.object({
  decide: z.boolean()
})

export class DecideDto extends createZodDto(DecideSchema) {}
