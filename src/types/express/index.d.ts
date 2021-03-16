import { IUserObject } from 'album-sdk'

declare global {
  namespace Express {
    interface Request {
      authedUser?: IUserObject
    }
  }
}
