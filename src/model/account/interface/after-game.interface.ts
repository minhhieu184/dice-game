import { WriteObjectId } from '@common'

export interface UpdateAfterGameArgs {
  userId: WriteObjectId
  balanceChange: number
  tokenId: WriteObjectId
  bet: number
}
