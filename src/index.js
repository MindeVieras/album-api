
import path from 'path'
import app from './config/express'
import routes from './routes/index.route'

// Home route
app.get('/', function(req, res){
  res.sendFile(path.join(__dirname, './index.html'))
})

// API routes
app.use('/api', routes)

// Start HTTP server
app.listen(app.get('port'), app.get('host'), () => {
  console.log(`Server running at http://${app.get('host')}:${app.get('port')}`)
})

export default app

