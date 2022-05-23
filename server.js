const express = require('express');
const http = require('http');

const station = require('./src/server/station');

const app = express();
app.use(express.static('./src/app'));

const server = http.createServer(app);

station(server);

server.listen(3000, () => console.log('3000'));
