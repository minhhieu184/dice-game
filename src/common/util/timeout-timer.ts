export class TimeoutTimer {
  private timer: NodeJS.Timeout | null = null
  private startTime: number
  private remainingTime: number

  constructor(private readonly callback: () => void, private readonly ms: number) {
    this.timer = setTimeout(callback, ms)
    this.startTime = Date.now()
    this.remainingTime = ms
  }

  pause() {
    if (!this.timer) return
    clearTimeout(this.timer)
    this.timer = null
    this.remainingTime -= Date.now() - this.startTime
  }

  resume() {
    if (this.timer) return
    this.timer = setTimeout(this.callback, this.remainingTime)
    this.startTime = Date.now()
  }
}
