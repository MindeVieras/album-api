import { Get, Post, JsonController, Param, Req, UseBefore } from 'routing-controllers'
import { AuthenticationMiddleware } from '../middleware/AuthenticationMiddleware'

import { User } from '../models'
import { UserService } from '../services'

/**
 * User controller class.
 */
@JsonController('/users')
// @UseBefore(AuthenticationMiddleware)
export default class UserController {
  constructor(private userService: UserService) {}

  /**
   * Create new user.
   */
  // @Post('/')
  // public async create(@Req() request) {
  //   const userModel = request.user.toJSON()
  //   return userModel
  // }

  /**
   * Get list of users.
   */
  @Get('/')
  public async getList(@Req() request) {
    // const users = User.findOne({ _id: '5dec216d36709189923dfe95' })
    // const { limit, page, sort } = req.query as { limit: number; page: number; sort: string }
    // const users = await User.paginate({}, { page, limit, sort, select: { hash: 0 } })
    // // Mutate pagination response to include user virtuals.
    // const virtualUsers = users.docs.map((d) => d.toObject())
    // return new ApiResponse(res, { ...users, docs: virtualUsers })
    return User.findOne({ _id: '5dec216d36709189923dfe95' })
  }

  /**
   * Get single user by id.
   */
  @Get('/:id')
  public async getOne(@Param('id') id: string) {
    return await this.userService.getOne(id)
  }

  @Get('/profile')
  public async getMe(@Req() request) {
    const userModel = request.user.toJSON()
    return userModel
  }
}
