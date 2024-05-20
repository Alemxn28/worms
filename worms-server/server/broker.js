const aedes = require('aedes')({
    persistence: require('aedes-persistence')()
  });
  const httpServer = require('http').createServer();
  const ws = require('websocket-stream');
  const port = 9000; // Puerto para conexiones TCP
  const wsPort = 9001; // Puerto para conexiones WebSocket, diferente para evitar conflictos
  
  // Servidor TCP para MQTT
  const server = require('net').createServer(aedes.handle);
  
  server.listen(port, function () {
    console.log(`Servidor MQTT corriendo en el puerto ${port}`);
  });
  
  // Servidor WebSocket para clientes MQTT
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
      console.log('Mensaje publicado por el cliente:', client.id);
      console.log('Mensaje:', packet.payload.toString());
    }
  });
  