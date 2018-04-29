
import express from 'express'

import authRoutes from './auth.route'
import albumsRoutes from './albums.route'
import uploaderRoutes from './uploader.route'
import mediaRoutes from './media.route'
import trashRoutes from './trash.route'
import frontRoutes from './front.route'
import utilsRoutes from './utils.route'

const router = express.Router()

router.use('/auth', authRoutes)
router.use('/albums', albumsRoutes)
router.use('/uploader', uploaderRoutes)
router.use('/media', mediaRoutes)
router.use('/trash', trashRoutes)
router.use('/front', frontRoutes)
router.use('/utils', utilsRoutes)

export default router
