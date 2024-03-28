import {
  badStraight,
  GamePoint,
  ResultMultiplier,
  ResultType,
  specialPoints,
  superStraight,
  superTriplet
} from '@common'
import { getRandomValues } from 'crypto'
import { scramble } from './scramble'

export interface PlayerResult {
  dices: number
  point: number
  multiplier: ResultMultiplier
  type: ResultType
}

export const generateResult = () => {
  const randoms = Array.from(getRandomValues(new Uint16Array(10)))
  return randoms.map((rand) => {
    const typePoint = (rand * 10000) / 65536
    if (0 <= typePoint && typePoint < 278) return generateSuperTriplet()
    if (278 <= typePoint && typePoint < 556) return generateSuperStraight()
    if (556 <= typePoint && typePoint < 834) return generateBadStraight()
    if (834 <= typePoint && typePoint < 5000) return generateSuperTwins()
    return generateNormal()
  })
}

const generateSuperTriplet: () => PlayerResult = () => {
  const dices = superTriplet[Math.floor(Math.random() * 6)]
  return {
    dices,
    point: specialPoints[dices],
    multiplier: ResultMultiplier.SUPER_TRIPLET,
    type: ResultType.SUPER_TRIPLET
  }
}

const generateSuperStraight: () => PlayerResult = () => {
  const dices = superStraight[Math.floor(Math.random() * 6)]
  return {
    dices,
    point: specialPoints[dices],
    multiplier: ResultMultiplier.SUPER_STRAIGHT,
    type: ResultType.SUPER_STRAIGHT
  }
}

const generateSuperTwins: () => PlayerResult = () => {
  const twinNumber = Math.floor(Math.random() * 6) + 1
  const singleNumber = Math.floor(Math.random() * 6) + 1
  if (twinNumber === singleNumber) return generateSuperTwins()
  return {
    dices: +scramble(`${twinNumber}${twinNumber}${singleNumber}`),
    point: singleNumber + 10,
    multiplier: ResultMultiplier.SUPER_TWINS,
    type: ResultType.SUPER_TWINS
  }
}

const checkSuperTwins = (number: string | number) => {
  const temp = {}
  for (const item of number.toString()) {
    if (temp[item]) return true
    temp[item] = true
  }
  return false
}
const generateNormal: () => PlayerResult = () => {
  const number1 = Math.floor(Math.random() * 6) + 1
  const number2 = Math.floor(Math.random() * 6) + 1
  const number3 = Math.floor(Math.random() * 6) + 1
  const number = +`${number1}${number2}${number3}`
  if (specialPoints[number]) return generateNormal()
  if (checkSuperTwins(number)) return generateNormal()
  return {
    dices: number,
    point: GamePoint.NORMAL_POINT,
    multiplier: ResultMultiplier.NORMAL,
    type: ResultType.NORMAL
  }
}

const generateBadStraight: () => PlayerResult = () => {
  const dices = badStraight[Math.floor(Math.random() * 6)]
  return {
    dices,
    point: specialPoints[dices],
    multiplier: ResultMultiplier.BAD_STRAIGHT,
    type: ResultType.BAD_STRAIGHT
  }
}
