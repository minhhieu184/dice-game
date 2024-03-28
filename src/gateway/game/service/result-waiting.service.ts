export class ResultWaiting {
  protected waitingTime(waitPlayerNum: number) {
    if (waitPlayerNum < 2) return 3 * 1000
    return (waitPlayerNum * 5 + 6) * 1000
  }
}
