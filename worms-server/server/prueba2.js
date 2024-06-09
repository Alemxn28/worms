
const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://172.190.84.143:9000');

client.on('connect', function () {
    console.log('Conectado al broker MQTT');

    // Publicar mensajes periódicamente
    setInterval(() => {
        // Simular datos de temperatura
        client.publish('temperatura', '22.5');
        client.publish('temperatura2', '23.0');

        // Simular datos de humedad
        client.publish('humedad', '55');
        client.publish('humedad2', '60');

        // Simular datos de pH
        client.publish('ph', '7');

        console.log('Mensaje publicado a los tópicos');
    }, 10000); // Publica cada 5 segundos
});

client.on('error', function (error) {
    console.log('Error de conexión:', error);
});
