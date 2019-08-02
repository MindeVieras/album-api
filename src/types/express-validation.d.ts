
export = express_validation

declare function express_validation(schema: object): any

declare namespace express_validation {
  class ValidationError {
    constructor(errors?: object[], options?: object)

    toJSON(): any

    toString(): string

  }

  function options(opts: any): void

}
