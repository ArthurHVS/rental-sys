
const http = require('http');
const app = require('./app');
const fs = require('fs');
const port = process.env.PORT || 3000;
const server = http.createServer(app);

server.listen(port);

console.log(new Date() + ' Servidor iniciado, ouvindo requisições na porta ' + port);
