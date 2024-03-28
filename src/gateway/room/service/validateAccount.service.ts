import { WSException } from '@common'
import { AccountService } from '@model/account/account.service'
import { DefaultTokenModule } from '@model/token/token.module'

export abstract class ValidateAccountService {
  constructor(protected readonly accountService: AccountService) {}

  protected async validateAccount(userId: string, minBet: number) {
    //* Account of user
    const account = await this.accountService.findOne({
      user_id: userId,
      token: DefaultTokenModule.DEFAULT_TOKEN._id
    })
    console.log('RoomGateway ~ account:', account)
    if (!account) throw new WSException('User account not found')

    //* Check balance
    if (account.balance < minBet * 1.5) throw new WSException('Not enough balance')

    return account
  }
}
