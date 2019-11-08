
import express from 'express'

const router = express.Router()

router.route('/')
  .get((req, res) => {
    res.end('Album!')
  })

export default router
