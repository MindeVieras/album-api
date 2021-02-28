import { IUserObject } from 'album-api-config'

declare global {
  namespace Express {
    interface Request {
      authedUser?: IUserObject
    }
  }
}
