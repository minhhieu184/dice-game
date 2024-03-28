import { booleanString } from '@common'
import { DefaultFindAllQuerySchema, RangeSchemaGenerator } from '@model/base'
import { createZodDto } from 'nestjs-zod'
import { z } from 'nestjs-zod/z'

const FindAllRoomQuerySchema = z
  .object({
    // is_test: z
    //   .string()
    //   .transform((val) =>
    //     val === 'true' ? true : val === 'false' ? false : undefined
    //   ),
    is_private: z.preprocess(booleanString, z.boolean()),
    minBet: RangeSchemaGenerator().transform(([start, end]) => {
      const mongoQuery = {}
      if (start) mongoQuery['$gte'] = start
      if (end) mongoQuery['$lte'] = end
      return mongoQuery
    }),
    room_tab: z.enum(['0', '1', '2', '3'])
  })
  .merge(DefaultFindAllQuerySchema)
  .partial()

export class FindAllRoomQueryDto extends createZodDto(FindAllRoomQuerySchema) {}
