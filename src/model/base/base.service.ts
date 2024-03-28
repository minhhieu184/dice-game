import {
  FilterQuery,
  HydratedDocument,
  ProjectionType,
  QueryOptions,
  Types,
  UpdateQuery
} from 'mongoose'
import { BaseEntity } from './base.entity'
import { IBaseService } from './base.interface'
import { BaseRepository } from './base.repository'
import { DefaultFindAllQueryDto } from './dto'

export abstract class BaseService<
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
> implements
    IBaseService<
      T,
      WT,
      TQueryHelpers,
      TInstanceMethods,
      TVirtuals,
      THydratedDocumentType
    >
{
  constructor(
    private readonly repository: BaseRepository<
      T,
      WT,
      TQueryHelpers,
      TInstanceMethods,
      TVirtuals,
      THydratedDocumentType
    >
  ) {}

  create(data: WT) {
    return this.repository.create(data)
  }

  async findAll(
    queryArgs: DefaultFindAllQueryDto & FilterQuery<T> & { searchField?: keyof T },
    projection: Exclude<ProjectionType<T>, string> | null = null,
    options: QueryOptions<T> | null = null
  ) {
    return this.repository.findAll(queryArgs, projection, options)
  }

  findById(
    id: string | Types.ObjectId,
    projection?: ProjectionType<T> | null,
    options?: QueryOptions<T> | null
  ) {
    return this.repository.findById(id, projection, options)
  }

  findOne(
    filter?: FilterQuery<T>,
    projection?: ProjectionType<T> | null,
    options?: QueryOptions<T> | null
  ) {
    return this.repository.findOne(filter, projection, options)
  }

  update(
    id: string | Types.ObjectId,
    data: UpdateQuery<T> & Partial<WT>,
    options?: QueryOptions<T> | null
  ) {
    return this.repository
      .update(id, data, { new: true, runValidators: true, ...options })
      .exec()
  }

  permanentlyDelete(id: string | Types.ObjectId) {
    return this.repository.permanentlyDelete(id).exec()
  }

  softDelete(id: string | Types.ObjectId) {
    return this.repository.softDelete(id).exec()
  }
}
