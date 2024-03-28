import { AxiosService } from '@config/axios/axios.service'
import { EnvironmentService } from '@config/environment'
import { BaseService } from '@model/base'
import { DefaultTokenModule } from '@model/token/token.module'
import { Injectable } from '@nestjs/common'
import { AccountRepository } from './account.repository'
import { Account, WriteAccount } from './entities/account.entity'
import { UpdateAfterGameArgs } from './interface'

@Injectable()
export class AccountService extends BaseService<Account, WriteAccount> {
  constructor(
    private readonly accountRepo: AccountRepository,
    private readonly axiosService: AxiosService,
    private readonly environmentService: EnvironmentService
  ) {
    super(accountRepo)
  }

  updateAfterGame(updateAfterGameArgs: UpdateAfterGameArgs) {
    const { userId, bet, tokenId } = updateAfterGameArgs
    if (tokenId.toString() === DefaultTokenModule.DEFAULT_TOKEN._id.toString()) {
      this.updateDynamicNft(userId.toString(), bet)
    }
    return this.accountRepo.updateAfterGame(updateAfterGameArgs)
  }

  async updateDynamicNft(userId: string, bet: number) {
    try {
      await this.axiosService.axiosRef.patch(
        `${this.environmentService.get('TABSAI_PRO_URL')}/user/dynamic-nft`,
        { userId, bet },
        {
          headers: {
            ['simple-secret']: this.environmentService.get('SIMPLE_SECRET')
          }
        }
      )
    } catch (error: any) {
      console.log('AccountService ~ updateDynamicNft ~ error:', error.message)
    }
  }
}
