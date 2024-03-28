import { trimString } from '@common'
import { DefaultFindAllWithSeqQuerySchema } from '@model/base'
import { createZodDto } from 'nestjs-zod'
import { z } from 'nestjs-zod/z'

const FindAllChatWithSeqQuerySchema = z
  .object({
    roomId: z.preprocess(trimString, z.coerce.string().length(24))
  })
  .merge(DefaultFindAllWithSeqQuerySchema)
  .partial()

export class FindAllChatWithSeqQueryDto extends createZodDto(
  FindAllChatWithSeqQuerySchema
) {}
