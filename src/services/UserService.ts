import { Inject } from 'typedi'

import { User, UserDocument } from '../models'
import { ServiceResponse } from './response/ServiceResponse'

/**
 * User service class.
 */
@Inject()
export class UserService {
  /**
   * Get single user by id.
   *
   * @param {string} id
   *   User id.
   */
  public async getOne(id: string): Promise<ServiceResponse<UserDocument>> {
    try {
      const user = await User.findById('id')
      return new ServiceResponse<UserDocument>(user.toObject())
    } catch (err) {
      return ServiceResponse.createErrorResponse(500, err)
    }
  }
}
