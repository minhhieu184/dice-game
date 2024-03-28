import { trimString } from '@common'
import { createZodDto } from 'nestjs-zod'
import { z } from 'nestjs-zod/z'

export const DefaultFindAllQuerySchema = z
  .object({
    fields: z.preprocess(trimString, z.coerce.string()),
    sort: z.preprocess(trimString, z.coerce.string()),
    page: z.coerce.number().int().min(1),
    take: z.coerce.number().int().min(1),
    search: z.preprocess(trimString, z.coerce.string().min(1).max(255))
  })
  .partial()

export class DefaultFindAllQueryDto extends createZodDto(
  DefaultFindAllQuerySchema
) {}
