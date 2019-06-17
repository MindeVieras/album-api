
import express from 'express'

import authenticateRoutes from './authenticate.route'
import usersRoutes from './users.route'
// import albumsRoutes from './albums.route'
// import uploaderRoutes from './uploader.route'
// import mediaRoutes from './media.route'
// import facesRoutes from './faces.route'
// import trashRoutes from './trash.route'
// import frontRoutes from './front.route'
// import utilsRoutes from './utils.route'

const router = express.Router()

router.use('/authenticate', authenticateRoutes)
// router.use('/users', usersRoutes)
// router.use('/albums', albumsRoutes)
// router.use('/uploader', uploaderRoutes)
// router.use('/media', mediaRoutes)
// router.use('/faces', facesRoutes)
// router.use('/trash', trashRoutes)
// router.use('/front', frontRoutes)
// router.use('/utils', utilsRoutes)

export default router
