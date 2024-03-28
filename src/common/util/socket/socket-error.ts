enum SocketErrorStatus {
  SUCCESS = 'Success',
  ERROR = 'Error'
}

export class SocketError extends Error {
  status: SocketErrorStatus = SocketErrorStatus.ERROR
  data: any

  constructor(message: string, data?: any) {
    super(message)
    this.data = data
  }
}

export class SocketResponse<T> {
  status: SocketErrorStatus = SocketErrorStatus.SUCCESS
  data: T

  constructor(data: T) {
    this.data = data
  }
}
