import { WsException } from '@nestjs/websockets'

export class WSException extends WsException {
  constructor(error: string | object) {
    super(error)
    this.name = 'WSException'
  }
}
