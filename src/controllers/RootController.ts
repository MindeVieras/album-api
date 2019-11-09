
import path from 'path'
import { Request, Response } from 'express'

import { controller, get } from './decorators'

/**
 * Root controller.
 *
 * Here goes all root routes like '/', '/about' etc...
 * It should not mix with /api routes.
 */
@controller('')
class RootController {

  /**
   * Home/root route.
   *
   * @param {Request} req
   *   Express request.
   * @param {Response} res
   *   Express response.
   */
  @get('/')
  public getRoot(req: Request, res: Response): void {
    // For now just send a static html file.
    res.sendFile(path.join(__dirname, '../index.html'))
  }

  /**
   * About page.
   *
   * @param {Request} req
   *   Express request.
   * @param {Response} res
   *   Express response.
   */
  @get('/about')
  public getAbout(req: Request, res: Response): void {
    res.send('About page!')
  }
}
