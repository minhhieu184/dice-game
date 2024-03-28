import { booleanString, trimString } from '@common'
import { createZodDto } from 'nestjs-zod'
import { z } from 'nestjs-zod/z'

export const DefaultFindAllWithSeqQuerySchema = z
  .object({
    next: z.coerce.number().int().min(0),
    take: z.coerce.number().int().min(1),
    new: z.preprocess(booleanString, z.boolean()),
    fields: z.preprocess(trimString, z.coerce.string())
    // search: z.string().min(1).max(255)
  })
  .partial()

export class DefaultFindAllWithSeqQueryDto extends createZodDto(
  DefaultFindAllWithSeqQuerySchema
) {}
