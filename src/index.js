
import http from 'http';
import express from 'express';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import config from './config.json';

let app = express();
app.server = http.createServer(app);

// logger
app.use(morgan('dev'));

app.use(bodyParser.json({
  limit : config.bodyLimit
}));

app.get('/', function (req, res) {
  res.send('hello world')
})

app.server.listen(process.env.PORT || config.port, () => {
  console.log(`Started on port ${app.server.address().port}`);
});

export default app;