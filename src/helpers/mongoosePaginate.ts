import { Model, Schema, PaginateResult, PaginateOptions } from 'mongoose'

/**
 * Mongoose pagination factory function.
 */
function paginate<T extends Model<any>>() {
  return async function(
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
export function mongoosePaginate<T extends Model<any>>(schema: Schema) {
  schema.statics.paginate = paginate<T>()
  return schema
}
