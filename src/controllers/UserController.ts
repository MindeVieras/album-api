import { Get, Post, JsonController, Req, UseBefore } from 'routing-controllers'
import { AuthenticationMiddleware } from '../middleware/AuthenticationMiddleware'

/**
 * User controller class.
 */
@JsonController('/users')
// @UseBefore(AuthenticationMiddleware)
export default class UserController {
  /**
   * Create new user.
   */
  @Post('/')
  public async create(@Req() request) {
    const userModel = request.user.toJSON()
    return userModel
  }

  /**
   * Get list of users.
   */
  @Get('/')
  public async getList(@Req() request) {
    // const userModel = request.user.toJSON()
    return 'fasdfds'
  }

  @Get('/profile')
  public async getMe(@Req() request) {
    const userModel = request.user.toJSON()
    return userModel
  }
}
