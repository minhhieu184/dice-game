import {
  FilterQuery,
  HydratedDocument,
  Model,
  ProjectionType,
  QueryOptions,
  Types,
  UpdateQuery
} from 'mongoose'
import { BaseEntity } from './base.entity'
import { IBaseRepository } from './base.interface'
import { DefaultFindAllQueryDto } from './dto'

export abstract class BaseRepository<
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
    IBaseRepository<
      T,
      WT,
      TQueryHelpers,
      TInstanceMethods,
      TVirtuals,
      THydratedDocumentType
    >
{
  constructor(
    private readonly model: Model<
      T,
      TQueryHelpers,
      TInstanceMethods,
      TVirtuals,
      THydratedDocumentType
    >
  ) {}

  create(data: WT) {
    return this.model.create(data)
  }

  async findAll(
    queryArgs: DefaultFindAllQueryDto & FilterQuery<T> & { searchField?: keyof T },
    projection: Exclude<ProjectionType<T>, string> | null = {},
    options: QueryOptions<T> | null = null
  ) {
    const {
      fields,
      sort,
      page = 1,
      take = 10,
      search,
      searchField,
      ..._queryParams
    } = queryArgs
    const queryParams = _queryParams as FilterQuery<T>

    /** Search */
    const isSearch = search && searchField
    if (isSearch) {
      console.log('searchField:', searchField)
      queryParams['$or'] = [
        { [searchField as any]: new RegExp(search, 'i') },
        { $text: { $search: search } }
      ]
      projection = { ...projection, searchScore: { $meta: 'textScore' } }
    }
    const query = this.model.find(queryParams, projection, options)
    const countQuery = this.model.countDocuments(queryParams)
    /** OrderBy */
    if (sort) {
      const orderBy = sort
        .split(',')
        .map((field) => field.trim())
        .join(' ')
      query.sort(orderBy)
      if (isSearch) query.sort({ searchScore: { $meta: 'textScore' } })
    }
    /** Select */
    if (fields) {
      const select = fields.split(',').map((field) => field.trim())
      query.select(select)
    }
    /** Pagination */
    const skip = (page - 1) * take
    query.skip(skip).limit(take)
    /** Execute Query */
    const [countResult, result] = await Promise.all([
      countQuery.exec(),
      query.exec()
    ])
    return {
      total: countResult,
      perPage: result.length,
      page: page,
      data: result
    }
  }

  findById(
    id: Types.ObjectId | string,
    projection?: ProjectionType<T> | null,
    options?: QueryOptions<T> | null
  ) {
    return this.model.findById(id, projection, options)
  }

  findOne(
    filter?: FilterQuery<T>,
    projection?: ProjectionType<T> | null,
    options?: QueryOptions<T> | null
  ) {
    return this.model.findOne(filter, projection, options)
  }

  update(
    id: Types.ObjectId | string,
    data: UpdateQuery<T> & Partial<WT>,
    options?: QueryOptions<T> | null
  ) {
    return this.model.findByIdAndUpdate(id, data, options)
  }

  permanentlyDelete(id: Types.ObjectId | string) {
    return this.model.findByIdAndDelete(id)
  }

  softDelete(id: Types.ObjectId | string) {
    return this.model.findByIdAndUpdate(
      id,
      { deleted_at: Date.now() },
      { new: true, runValidators: true }
    )
  }
}
