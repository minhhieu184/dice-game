import { User } from '@model/user/entities/user.entity'
import { Socket as _Socket } from 'socket.io'

interface DefaultEventsMap {
  [event: string]: (...args: any[]) => void
}

type SocketData = Omit<User, '_id'> & { _id: string }

export type Socket<SD = SocketData> = _Socket<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  SD
>
