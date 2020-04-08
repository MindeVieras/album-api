import { IUserObject } from '../../models'

declare global {
  namespace Express {
    interface Request {
      authedUser?: IUserObject
    }
  }
}
