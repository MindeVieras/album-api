
import http from 'http'
import path from 'path'
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import bodyParser from 'body-parser'
import config from './config.json'

let app = express()
app.server = http.createServer(app)

// Logger
app.use(morgan('dev'))

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
  limit : config.bodyLimit
}));

// Routes
app.get('/', function(req, res){
  res.sendFile(path.join(__dirname, './index.html'))
})
require('./routes/authenticate')(app)
require('./routes/users')(app)
require('./routes/albums')(app)
require('./routes/media')(app)
require('./routes/upload')(app)
require('./routes/trash')(app)
require('./routes/front')(app)

// Start HTTP server
app.server.listen(process.env.PORT || config.port, () => {
  console.log(`Started on port ${app.server.address().port}`)
})

export default app

