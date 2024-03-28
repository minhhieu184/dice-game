import { Types } from 'mongoose'

type OmitExclude<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
export type WriteType2<M, N> = OmitExclude<M, Extract<keyof M, keyof N>> & N

export type WriteType<T1, T2 extends { [K in keyof T1]?: any }> = Omit<
  T1,
  '_id' | keyof T2
> &
  T2

export type WriteObjectId = string | Types.ObjectId
