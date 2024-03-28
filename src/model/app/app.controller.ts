import { InjectRedis } from '@common'
import { LockService } from '@config/lock'
import { BadRequestException, Controller, Get, Param } from '@nestjs/common'
import { Redis } from 'ioredis'
import { AppService } from './app.service'

@Controller()
export class AppController {
  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly appService: AppService,
    private readonly lockService: LockService
  ) {}

  @Get('back-door/:result')
  async backDoor(@Param('result') result: string) {
    await this.redis.set('back-door', result)
    return { status: 'ok', backDoorResult: result }
  }

  @Get('1')
  async getHello() {
    console.log('request xxxxxxxxxxxxxx')

    const isBusy = this.lockService.isBusy('key')
    console.log('AppController ~ getHello ~ isBusy:', isBusy)
    const x = this.lockService.acquire<number>('key', async (done) => {
      console.log('lock')
      await new Promise((resolve) => setTimeout(resolve, 3000))
      throw new BadRequestException('test')
      console.log('unlock')
      done(null, 456)
    })
    console.log('get async ')

    // const res = await x
    // console.log('AutoPlayGateway ~ onModuleInit ~ res:', res)
  }

  // @Get('2')
  // async getHello2() {
  //   console.log('request xxxxxxxxxxxxxx')

  //   const isBusy = this.lock.isBusy('key2')
  //   console.log('AppController ~ getHello2 ~ isBusy:', isBusy)
  //   const a = this.lock.acquire<number>('key2', async (done) => {
  //     try {
  //       console.log('lock')
  //       await new Promise((resolve) => setTimeout(resolve, 5000))
  //       throw new BadRequestException('test')
  //       console.log('unlock')
  //       done(null, 456)
  //     } catch (error: any) {
  //       done(error, 123123)
  //       // done(null, 123123)
  //     }
  //   })
  //   console.log('get async ')

  //   const res = await a
  //   console.log('AutoPlayGateway ~ onModuleInit ~ res:', res)
  // }
}
