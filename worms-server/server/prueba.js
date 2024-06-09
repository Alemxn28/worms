const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://172.190.84.143:9000');

client.on('connect', function () {
  console.log('Cliente conectado');
  // Publicar cada 10 segundos
  setInterval(() => {
    const temp = getRandomFloat(20.0, 25.0).toFixed(2);
    client.publish('temperatura', temp);
  },10000);
  setInterval(() => {
    const humidity = getRandomInt(70, 80);
    client.publish('humedad', humidity.toString());
  },10000);

  setInterval(() => {
    const pH = getRandomFloat(3.0, 10.0).toFixed(2);
    client.publish('ph', pH);
    
  }, 10000); // Intervalo de 10 segundos
});

client.on('message', function (topic, message) {
  console.log(`Mensaje recibido bajo el tópico ${topic}: ${message.toString()}`);
});

client.on('error', function (error) {
  console.log('Error en MQTT:', error.message);
});

function getRandomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
