import express from 'express'

import authRoutes from './auth.route'
import usersRoutes from './users.route'
import albumsRoutes from './albums.route'
import uploaderRoutes from './uploader.route'
/**
 * Create API router.
 *
 * @path /api
 */
const router = express.Router()

router.use('/auth', authRoutes)
router.use('/users', usersRoutes)
router.use('/albums', albumsRoutes)
router.use('/uploader', uploaderRoutes)

export default router
