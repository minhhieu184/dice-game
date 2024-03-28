import {
  HydratedDocument,
  ModifyResult,
  ProjectionType,
  QueryOptions,
  Types,
  UpdateQuery
} from 'mongoose'
import { BaseEntity } from './base.entity'
import { DefaultFindAllQueryDto } from './dto'

export interface IBaseRepository<
  T extends BaseEntity,
  WT = T,
  TQueryHelpers = object,
  TInstanceMethods = object,
  TVirtuals = object,
  THydratedDocumentType = HydratedDocument<
    T,
    TVirtuals & TInstanceMethods,
    TQueryHelpers
  >
> {
  create(data: WT): Promise<THydratedDocumentType>

  findAll(
    queryArgs: DefaultFindAllQueryDto,
    projection: Exclude<ProjectionType<T>, string> | null,
    options: QueryOptions<T> | null
  ): Promise<{
    total: number
    perPage: number
    page: number
    data: THydratedDocumentType[]
  }>

  findById(
    id: Types.ObjectId | string,
    projection?: ProjectionType<T> | null,
    options?: QueryOptions<T> | null
  ): Promise<THydratedDocumentType | null>

  update(
    id: Types.ObjectId | string,
    update?: UpdateQuery<T> & Partial<WT>,
    options?: QueryOptions<T> | null
  ): Promise<THydratedDocumentType | null>

  softDelete(id: Types.ObjectId | string): Promise<THydratedDocumentType | null>

  permanentlyDelete(
    id: Types.ObjectId | string
  ): Promise<ModifyResult<THydratedDocumentType> | null>
}

export interface IBaseService<
  T extends BaseEntity,
  WT = T,
  TQueryHelpers = object,
  TInstanceMethods = object,
  TVirtuals = object,
  THydratedDocumentType = HydratedDocument<
    T,
    TVirtuals & TInstanceMethods,
    TQueryHelpers
  >
> {
  create(data: WT): Promise<THydratedDocumentType>

  findAll(
    queryArgs: DefaultFindAllQueryDto,
    projection: Exclude<ProjectionType<T>, string> | null,
    options: QueryOptions<T> | null
  ): Promise<{
    total: number
    perPage: number
    page: number
    data: THydratedDocumentType[]
  }>

  findById(
    id: string,
    projection?: ProjectionType<T> | null,
    options?: QueryOptions<T> | null
  ): Promise<THydratedDocumentType | null>

  update(
    id: string,
    update?: UpdateQuery<T> & Partial<WT>,
    options?: QueryOptions<T> | null
  ): Promise<THydratedDocumentType | null>

  softDelete(id: string): Promise<THydratedDocumentType | null>

  permanentlyDelete(id: string): Promise<ModifyResult<THydratedDocumentType> | null>
}
