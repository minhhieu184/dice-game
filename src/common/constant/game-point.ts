export enum ResultType {
  SUPER_TRIPLET = 'SUPER_TRIPLET',
  SUPER_STRAIGHT = 'SUPER_STRAIGHT',
  SUPER_TWINS = 'SUPER_TWINS',
  NORMAL = 'NORMAL',
  BAD_STRAIGHT = 'BAD_STRAIGHT'
}

export enum ResultMultiplier {
  SUPER_TRIPLET = 2,
  SUPER_STRAIGHT = 1.5,
  SUPER_TWINS = 1,
  NORMAL = -1,
  BAD_STRAIGHT = -1.5
}

export enum GamePoint {
  SUPER_STRAIGHT_POINT = 20,
  NORMAL_POINT = 0,
  BAD_STRAIGHT_POINT = -1
}
export const specialPoints = {
  '111': 39,
  '666': 38,
  '555': 37,
  '444': 36,
  '333': 35,
  '222': 34,
  '456': GamePoint.SUPER_STRAIGHT_POINT,
  '465': GamePoint.SUPER_STRAIGHT_POINT,
  '546': GamePoint.SUPER_STRAIGHT_POINT,
  '564': GamePoint.SUPER_STRAIGHT_POINT,
  '645': GamePoint.SUPER_STRAIGHT_POINT,
  '654': GamePoint.SUPER_STRAIGHT_POINT,
  '123': GamePoint.BAD_STRAIGHT_POINT,
  '132': GamePoint.BAD_STRAIGHT_POINT,
  '213': GamePoint.BAD_STRAIGHT_POINT,
  '231': GamePoint.BAD_STRAIGHT_POINT,
  '312': GamePoint.BAD_STRAIGHT_POINT,
  '321': GamePoint.BAD_STRAIGHT_POINT
}

/** List Special case */
export const superTriplet = [111, 666, 555, 444, 333, 222]
export const superStraight = [456, 465, 546, 564, 645, 654]
export const badStraight = [123, 132, 213, 231, 312, 321]

// Min player in room to start game
export const PLAYER_TO_START = 3
