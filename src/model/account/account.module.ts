import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { AccountController } from './account.controller'
import { AccountRepository } from './account.repository'
import { AccountService } from './account.service'
import { Account, AccountSchema } from './entities/account.entity'

@Module({
  controllers: [AccountController],
  providers: [AccountService, AccountRepository],
  imports: [
    MongooseModule.forFeature([{ name: Account.name, schema: AccountSchema }])
  ],
  exports: [AccountService]
})
export class AccountModule {}
