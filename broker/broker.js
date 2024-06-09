const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
const aedes = require('aedes')({
  persistence: require('aedes-persistence')()
});
const http = require('http');
const net = require('net');
const ws = require('websocket-stream');
require('dotenv').config()

const tcpPort = process.env.TCP_PORT; // Puerto para conexiones TCP
const wsPort = process.env.WS_PORT; // Puerto para conexiones WebSocket

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
  });
} else {
  console.log(`Worker ${process.pid} started`);

  // Servidor TCP para MQTT
  const tcpServer = net.createServer(aedes.handle);
  tcpServer.listen(tcpPort, function () {
    console.log(`Servidor MQTT TCP corriendo en el puerto ${tcpPort}`);
  });

  // Servidor WebSocket para MQTT
  const httpServer = http.createServer();
  ws.createServer({ server: httpServer }, aedes.handle);
  httpServer.listen(wsPort, function () {
    console.log(`Servidor MQTT WebSocket corriendo en el puerto ${wsPort}`);
  });

  // Eventos de Aedes
  aedes.on('client', function (client) {
    console.log('Cliente conectado:', client.id);
  });

  aedes.on('clientDisconnect', function (client) {
    console.log('Cliente desconectado:', client.id);
  });

  aedes.on('publish', function (packet, client) {
    if (client) {
      console.log(`Mensaje publicado por ${client.id}:`, packet.payload.toString());
    }
  });
}
