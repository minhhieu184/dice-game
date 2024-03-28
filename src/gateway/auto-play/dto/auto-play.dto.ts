import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

const AutoPlaySchema = z
  .object({
    isAutoPlay: z.boolean(),
    autoPlayBet: z.coerce.number().nonnegative(),
    autoPlayBetInPercent: z.coerce.number().min(0).max(100),
    autoPlayHostBet: z.coerce.number().nonnegative(),
    autoPlayHostBetInPercent: z.coerce.number().min(0).max(100)
  })
  .superRefine((data, ctx) => {
    if (data.isAutoPlay) {
      if (!data.autoPlayBet && !data.autoPlayBetInPercent) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            'At least one of autoPlayBet or autoPlayBetInPercent must be provided'
        })
      }
      if (!data.autoPlayHostBet && !data.autoPlayHostBetInPercent)
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            'At least one of autoPlayHostBet or autoPlayHostBetInPercent must be provided'
        })
    }
  })

export class AutoPlayDto extends createZodDto(AutoPlaySchema) {}
