import { BaseRepository } from '@model/base'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { User } from './entities/user.entity'

export class UserRepository extends BaseRepository<User> {
  constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {
    super(userModel)
  }
}
