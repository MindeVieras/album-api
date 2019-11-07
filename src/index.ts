
import path from 'path'

import { config } from './config'
import app from './config/express'
import routes from './routes/index.route'

// Home route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, './index.html'))
})
// API routes
app.use('/api', routes)

// Start HTTP server
app.listen(config.port, () => {
  console.log(`Server running at http://${config.host}:${config.port}`)
})

export default app
