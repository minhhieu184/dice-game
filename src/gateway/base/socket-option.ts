import { ServerOptions } from 'socket.io'

export const socketOption = {
  cors: { origin: '*' }
} satisfies Partial<ServerOptions>
