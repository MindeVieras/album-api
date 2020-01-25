/// <reference types="mongoose" />

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
    offset?: number
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
