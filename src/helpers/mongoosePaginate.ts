import { Model, Schema, PaginateResult, PaginateOptions } from 'mongoose'

/**
 * Mongoose pagination factory function.
 */
function paginate<T extends Model<any>>() {
  return async function (
    this: T,
    query: Object = {},
    options: PaginateOptions = {},
  ): Promise<PaginateResult<T>> {
    let limit = options.limit ?? 10
    let offset = options.offset && options.offset > 0 ? options.offset : 0

    let docs: T[] = []

    // Get total number of documents.
    const total = await this.countDocuments(query)

    if (limit !== 0) {
      limit = limit < 0 ? 0 : limit
      const $docs = this.find(query)
        .select(options.select)
        .sort(options.sort)
        .skip(offset)
        .limit(limit)

      if (options.populate) {
        new Array().concat(options.populate).forEach((item) => {
          $docs.populate(item)
        })
      }
      docs = await $docs.exec()
    }

    return { docs, total, limit, offset }
  }
}

/**
 *  Adding paginate to mongoose.
 *
 * @param {mongoose.Schema} schema
 *   Mongoose schema object.
 *
 * @returns {mongoose.Schema}
 *   Mongoose schema including paginate plugin.
 */
export function mongoosePaginate(schema: Schema) {
  schema.statics.paginate = paginate()
  return schema
}

declare module 'mongoose' {
  export interface PaginateOptions {
    select?: Object | string
    sort?: Object | string
    populate?: Array<Object> | Array<string> | Object | string | QueryPopulateOptions
    offset?: number
    limit?: number
  }

  interface QueryPopulateOptions {
    // Space delimited path(s) to populate.
    path: string
    // Optional fields to select.
    select?: any
    // Optional query conditions to match.
    match?: any
    // Optional model to use for population.
    model?: string | Model<any>
    // Optional query options like sort, limit, etc.
    options?: any
    // Deep populate.
    populate?: QueryPopulateOptions | QueryPopulateOptions[]
  }

  export interface PaginateResult<T> {
    docs: T[]
    total: number
    limit: number
    offset: number
  }

  interface PaginateModel<T extends Document> extends Model<T> {
    paginate(query?: Object, options?: PaginateOptions): Promise<PaginateResult<T>>
  }

  export function model<T extends Document>(
    name: string,
    schema?: Schema,
    collection?: string,
    skipInit?: boolean,
  ): PaginateModel<T>

  export function model<T extends Document, U extends PaginateModel<T>>(
    name: string,
    schema?: Schema,
    collection?: string,
    skipInit?: boolean,
  ): U
}
