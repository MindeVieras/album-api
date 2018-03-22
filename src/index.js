
import http from 'http'
import path from 'path'
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import bodyParser from 'body-parser'
import fallback from 'express-history-api-fallback'
import config from './config.json'

import authenticateRoutes from './routes/authenticate'
import albumsRoutes from './routes/albums'
import uploaderRoutes from './routes/uploader'

let app = express()
app.server = http.createServer(app)

// Logger
app.use(morgan('dev'))

// Fallback to index.html
app.use(fallback(__dirname + '/dist/index.html'))

// CORS
app.use(cors({
  exposedHeaders: config.corsHeaders
}))

// Body parser
app.use(bodyParser.urlencoded({
  extended: true,
  limit: '50mb'
}))
app.use(bodyParser.json({
  limit : '50mb'
}))

app.set('title', 'My Site')
// Routes
app.get('/', function(req, res){
  res.sendFile(path.join(__dirname, './index.html'))
})

// Run API routes
authenticateRoutes(app)
albumsRoutes(app)
uploaderRoutes(app)

require('./routes/users')(app)
require('./routes/media')(app)
require('./routes/trash')(app)
require('./routes/front')(app)
require('./routes/utils')(app)

// Start HTTP server
app.server.listen(process.env.PORT || config.port, () => {
  console.log(`Started on port ${app.server.address().port}`)
})

export default app

