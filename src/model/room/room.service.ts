import { AccountService } from '@model/account/account.service'
import { Account } from '@model/account/entities/account.entity'
import { BaseService } from '@model/base'
import { DefaultTokenModule } from '@model/token/token.module'
import { BadRequestException, Injectable } from '@nestjs/common'
import { FindAllRoomQueryDto } from './dto'
import { IRoomMethods, Room, WriteRoom } from './entities/room.entity'
import { RoomRepository } from './room.repository'

@Injectable()
export class RoomService extends BaseService<
  Room,
  WriteRoom,
  object,
  IRoomMethods
> {
  constructor(
    private readonly roomRepository: RoomRepository,
    private readonly accountService: AccountService
  ) {
    super(roomRepository)
  }

  async findAllRoom(findAllRoomQueryDto: FindAllRoomQueryDto) {
    const { room_tab, is_private, ...query } = findAllRoomQueryDto
    //* Room tab
    if (room_tab === '0') query['token.is_test'] = false
    if (room_tab === '1') query['token._id'] = DefaultTokenModule.DEFAULT_TOKEN._id
    if (room_tab === '2') {
      query['token._id'] = { $ne: DefaultTokenModule.DEFAULT_TOKEN._id }
      query['token.is_test'] = false
    }
    if (room_tab === '3') query['token.is_test'] = true

    //* Private room
    if (is_private) query['password'] = { $exists: true, $ne: '' }
    else if (is_private === false)
      query['$or'] = [{ password: '' }, { password: { $exists: false } }]

    const roomResponse = await this.findAll({
      ...query,
      searchField: 'name',
      expiredAt: { $not: { $lt: new Date() } }
    })
    const rooms = await roomResponse.data.map((room) => room.toObject())
    return { ...roomResponse, data: rooms }
  }

  async joinRandomRoom(userId: string) {
    const data = await this.accountService.findAll({ user_id: userId, take: 10 })
    const accounts = data.data
    const accountTyenIndex = accounts.findIndex(
      (account) =>
        account.token.toString() === DefaultTokenModule.DEFAULT_TOKEN._id.toString()
    )
    if (accountTyenIndex === -1)
      throw new BadRequestException('Account TYEN not found')
    const accountTyen = accounts.splice(accountTyenIndex, 1)[0]

    //* Find room with TYEN token
    try {
      return await this._joinableRoom(accountTyen)
    } catch (error) {}
    try {
      return await Promise.any(
        accounts.map((account) => this._joinableRoom(account))
      )
    } catch (error) {
      throw new BadRequestException('There is no room available for you')
    }

    //* Find room with other token
  }

  reloadHandle() {
    return this.roomRepository.reloadHandle()
  }

  private async _joinableRoom(account: Account): Promise<Room> {
    const roomData = await this.findAll({
      'token._id': account.token,
      current_player_in_room: { $ne: 10 },
      minBet: { $lte: account.balance / 1.5 },
      'token.is_test': false,
      password: { $exists: false },
      expiredAt: { $not: { $lt: new Date() } },
      sort: '-current_player_in_room',
      take: 1
    })
    if (roomData.data[0]) return roomData.data[0]
    throw new BadRequestException('Room not found')
  }
}
