import { BaseService } from '@model/base'
import { Injectable } from '@nestjs/common'
import { User } from './entities/user.entity'
import { UserRepository } from './user.repository'

@Injectable()
export class UserService extends BaseService<User> {
  constructor(private readonly userRepo: UserRepository) {
    super(userRepo)
  }
}
