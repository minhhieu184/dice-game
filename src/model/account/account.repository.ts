import { BaseRepository } from '@model/base'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Account, WriteAccount } from './entities/account.entity'
import { UpdateAfterGameArgs } from './interface'

export class AccountRepository extends BaseRepository<Account, WriteAccount> {
  constructor(
    @InjectModel(Account.name) public readonly accountModel: Model<Account>
  ) {
    super(accountModel)
  }

  updateAfterGame({ balanceChange, bet, tokenId, userId }: UpdateAfterGameArgs) {
    return this.accountModel.findOneAndUpdate(
      { user_id: userId, token: tokenId },
      {
        $inc: {
          balance: balanceChange,
          profitSimple: balanceChange,
          gameCountSimple: 1,
          totalBetSimple: bet,
          allTotalBet: bet
        },
        $max: { maxProfitSimple: balanceChange },
        $min: { minProfitSimple: balanceChange }
      },
      { new: true }
    )
  }
}
