export class IntervalTimer {
  private timer: NodeJS.Timeout | null = null
  private startTime: number
  private remainingTime: number

  constructor(private readonly callback: () => void, private readonly ms: number) {
    this.timer = setInterval(callback, ms)
    this.startTime = Date.now()
    this.remainingTime = ms
  }

  pause() {
    if (!this.timer) return
    clearInterval(this.timer)
    this.timer = null
    this.remainingTime -= Date.now() - this.startTime
  }

  resume() {
    if (this.timer) return
    this.timer = setTimeout(this.callback, this.remainingTime)
    this.startTime = Date.now()
  }
}
