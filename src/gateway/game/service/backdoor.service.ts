import {
  badStraight,
  GamePoint,
  ResultMultiplier,
  ResultType,
  specialPoints,
  superStraight,
  superTriplet
} from '@common'
import { ResultWaiting } from './result-waiting.service'

export abstract class Backdoor extends ResultWaiting {
  protected backdoorResult(backdoorDice: string) {
    const backdoorResult = +backdoorDice
    const isTriple = superTriplet.includes(backdoorResult)
    const isSuperStraight = superStraight.includes(backdoorResult)
    let isTwins = false
    let doubleNumber = ''
    const tmp = {}
    for (const dice of backdoorDice) {
      if (tmp[dice]) {
        isTwins = true
        doubleNumber = dice
        break
      }
      tmp[dice] = true
    }
    const isBadStraight = badStraight.includes(backdoorResult)
    if (isTriple) {
      return {
        dices: backdoorResult,
        multiplier: ResultMultiplier.SUPER_TRIPLET,
        point: specialPoints[backdoorResult],
        type: ResultType.SUPER_TRIPLET
      }
    } else if (isSuperStraight) {
      return {
        dices: backdoorResult,
        multiplier: ResultMultiplier.SUPER_STRAIGHT,
        point: specialPoints[backdoorResult],
        type: ResultType.SUPER_STRAIGHT
      }
    } else if (isTwins) {
      const singleNumber = +backdoorDice.replaceAll(doubleNumber, '')
      return {
        dices: backdoorResult,
        multiplier: ResultMultiplier.SUPER_TWINS,
        point: singleNumber + 10,
        type: ResultType.SUPER_TWINS
      }
    } else if (isBadStraight) {
      return {
        dices: backdoorResult,
        multiplier: ResultMultiplier.BAD_STRAIGHT,
        point: specialPoints[backdoorResult],
        type: ResultType.BAD_STRAIGHT
      }
    } else {
      return {
        dices: backdoorResult,
        multiplier: ResultMultiplier.NORMAL,
        point: GamePoint.NORMAL_POINT,
        type: ResultType.NORMAL
      }
    }
  }
}
