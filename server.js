const express = require('express');
const https = require('https');
const http = require('http');
const fs = require('fs');

const app = express();

const PORT = 65324;


const renderRouter = require(__dirname + '/Render.js');

const emulatorRouter = require(__dirname + '/Emulator.js');

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use('/render', renderRouter);
app.use('/emulate', emulatorRouter);

const ssl = true;

if (ssl) {
	const credentials = {
		key: fs.readFileSync('/etc/letsencrypt/live/render.fridaysforfuture.de/privkey.pem', 'utf8'),
		cert: fs.readFileSync('/etc/letsencrypt/live/render.fridaysforfuture.de/cert.pem', 'utf8'),
		ca: fs.readFileSync('/etc/letsencrypt/live/render.fridaysforfuture.de/chain.pem', 'utf8')
	};

  https.createServer(credentials, app).listen(PORT);
  console.log('(SSL) Example app listening on port ' + PORT + '!');
}
else {
  http.createServer(app).listen(PORT);
  console.log('(HTTP) Example app listening on port ' + PORT + '!');
}
