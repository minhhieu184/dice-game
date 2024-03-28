import { trimString } from '@common'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

const CreateChatSchema = z.object({
  message: z.preprocess(trimString, z.coerce.string().min(1).max(255))
})

export class CreateChatDto extends createZodDto(CreateChatSchema) {}
