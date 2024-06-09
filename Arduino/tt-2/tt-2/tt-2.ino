#include <WiFi.h>
#include <PubSubClient.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <WiFiManager.h>

// Definir el pin para los sensores OneWire
#define ONE_WIRE_BUS 15
const int humedadSensorPin1 = 34; // Pin para el primer sensor de humedad
const int humedadSensorPin2 = 35; // Pin para el segundo sensor de humedad
const int ventiladorPin = 5;      // Ventilador
const int bombaDeAguaPin = 4;     // Bomba de agua     // GPIO 32 para entrada ADC del sensor de pH
const int nivelAguaSensorPin = 25; // Pin para el sensor de nivel de agua (flotador)

float slope = -6.81;  
float intercept = 23.87;  

const int numReadings = 10;
int humedadReadings1[numReadings]; 
int humedadReadings2[numReadings];
int readIndex1 = 0;         
int readIndex2 = 0;
int totalHumedad1 = 0;             
int totalHumedad2 = 0;
int averageHumedad1 = 0;
int averageHumedad2 = 0;

OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

const char* mqttServer = " 192.168.130.199"; 
const int mqttPort = 9000;
const char* mqttUser = "";
const char* mqttPassword = "";

WiFiClient espClient;
PubSubClient client(espClient);

bool isAutomaticMode = true; // Variable para controlar el modo automático

void setup() {
    Serial.begin(9600);
    WiFiManager wifiManager;

    if (!wifiManager.autoConnect("ESP32NOPH")) {
        Serial.println("Fallo en la conexión");
        ESP.restart();
    }

    Serial.println("Conectado a la red WiFi.");
    pinMode(bombaDeAguaPin, OUTPUT);
    pinMode(ventiladorPin, OUTPUT);
    pinMode(nivelAguaSensorPin, INPUT_PULLUP); // Configurar el pin del flotador como entrada con resistencia pull-up

    digitalWrite(bombaDeAguaPin, LOW);
    digitalWrite(ventiladorPin, LOW);

    client.setServer(mqttServer, mqttPort);
    client.setCallback(callback); // Establecer la función de callback para manejar mensajes MQTT

    while (!client.connected()) {
        Serial.println("Connecting to MQTT...");
        if (client.connect("ESP32Client1", mqttUser, mqttPassword)) {
            Serial.println("Connected");
            client.subscribe("actuador/#"); // Suscribirse a los comandos de actuadores
            client.subscribe("modo/automatico"); // Suscribirse a los cambios de modo automático/manual
        } else {
            Serial.print("Failed with state ");
            Serial.print(client.state());
            delay(2000);
        }
    }
    for (int thisReading = 0; thisReading < numReadings; thisReading++) {
        humedadReadings1[thisReading] = 0;
        humedadReadings2[thisReading] = 0;
    }

    sensors.begin();
    analogReadResolution(12); 
}

void callback(char* topic, byte* payload, unsigned int length) {
    String messageTemp;
    for (unsigned int i = 0; i < length; i++) {
        messageTemp += (char)payload[i];
    }

    Serial.print("Mensaje recibido en tópico: ");
    Serial.print(topic);
    Serial.print(". Mensaje: ");
    Serial.println(messageTemp);

    if (String(topic) == "modo/automatico") {
        if (messageTemp == "ON") {
            isAutomaticMode = true;
        } else if (messageTemp == "OFF") {
            isAutomaticMode = false;
            // Apagar los actuadores cuando se pasa a modo manual
            digitalWrite(ventiladorPin, LOW);
            digitalWrite(bombaDeAguaPin, LOW);
        }
        Serial.print("Modo automático: ");
        Serial.println(isAutomaticMode ? "ON" : "OFF");
    } else if (String(topic) == "actuador/ventilador") {
        if (!isAutomaticMode) {
            if (messageTemp == "ON") {
                digitalWrite(ventiladorPin, HIGH);
            } else if (messageTemp == "OFF") {
                digitalWrite(ventiladorPin, LOW);
            }
        }
    } else if (String(topic) == "actuador/bombaDeAgua") {
        if (!isAutomaticMode) {
            if (messageTemp == "ON") {
                digitalWrite(bombaDeAguaPin, HIGH);
            } else if (messageTemp == "OFF") {
                digitalWrite(bombaDeAguaPin, LOW);
            }
        }
    }
}

void loop() {
    client.loop();

    if (isAutomaticMode) {
        sensors.requestTemperatures();
        float temperaturaPromedio = leerYPromediarTemperaturas();

        // Leer el estado del flotador de nivel de agua
        int nivelAgua = digitalRead(nivelAguaSensorPin);
        bool aguaSuficiente = (nivelAgua == HIGH); // Invertir lógica: HIGH significa agua suficiente, LOW significa nivel bajo

        if (aguaSuficiente) {
            Serial.println("Nivel de agua: Suficiente");
        } else {
            Serial.println("Nivel de agua: Bajo");
        }

        char tempString[20];
        dtostrf(temperaturaPromedio, 1, 2, tempString);
        Serial.print("Temperatura Promedio: ");
        Serial.print(tempString);
        Serial.println(" °C");
        client.publish("temperatura", tempString);

        averageHumedad1 = leerYSuavizarHumedad(humedadSensorPin1, humedadReadings1, readIndex1, totalHumedad1);
        averageHumedad2 = leerYSuavizarHumedad(humedadSensorPin2, humedadReadings2, readIndex2, totalHumedad2);

        readIndex1 = (readIndex1 + 1) % numReadings;
        readIndex2 = (readIndex2 + 1) % numReadings;

        float humedadPromedio = (averageHumedad1 + averageHumedad2) / 2.0;

        char humedadString1[8];
        char humedadString2[8];
        char humedadPromedioString[8];
        
        sprintf(humedadString1, "%d", averageHumedad1);
        sprintf(humedadString2, "%d", averageHumedad2);
        dtostrf(humedadPromedio, 1, 2, humedadPromedioString);

        Serial.print("Valor de humedad promediado sensor 1: ");
        Serial.println(humedadString1);
        Serial.print("Valor de humedad promediado sensor 2: ");
        Serial.println(humedadString2);
        Serial.print("Valor de humedad promediado de ambos sensores: ");
        Serial.println(humedadPromedioString);
        client.publish("humedad", humedadPromedioString);

        double temp = atof(tempString);
        double humedadPromedioDouble = atof(humedadPromedioString);

        unsigned long currentMillis = millis();
        Serial.print("Current Millis: ");
        Serial.println(currentMillis);

        // Control del ventilador
        if (temp > 25.0) {
            digitalWrite(ventiladorPin, HIGH); // Encender ventilador
            Serial.println("Ventilador encendido (Temp > 25°C)");
        } else {
            digitalWrite(ventiladorPin, LOW); // Apagar ventilador
            Serial.println("Ventilador apagado (Temp <= 25°C)");
        }

        // Control de la bomba de agua
        if (aguaSuficiente) {
            if (humedadPromedioDouble < 60.0) {
                digitalWrite(bombaDeAguaPin, HIGH); // Bomba de agua encendida
                Serial.println("Bomba de agua encendida (Hum < 60%)");
            } else {
                digitalWrite(bombaDeAguaPin, LOW); // Bomba de agua apagada
                Serial.println("Bomba de agua apagada (Hum >= 60%)");
            }
        } else {
            digitalWrite(bombaDeAguaPin, LOW); // Apagar la bomba de agua si el nivel de agua es bajo
            Serial.println("Bomba de agua desactivada por nivel bajo de agua");
        }

        
        delay(1300);
    }
}

int leerYSuavizarHumedad(int pin, int readings[], int &readIndex, int &total) {
    int humedad = analogRead(pin);
    int porcentajeHumedad = map(humedad, 2400, 1030, 0, 100);
    porcentajeHumedad = constrain(porcentajeHumedad, 0, 100);

    total = total - readings[readIndex];
    readings[readIndex] = porcentajeHumedad;
    total = total + readings[readIndex];
    int average = total / numReadings;

    return average;
}

float leerYPromediarTemperaturas() {
    float tempC1 = sensors.getTempCByIndex(0);
    if (tempC1 != DEVICE_DISCONNECTED_C) {
        Serial.print("Sensor 1 Temperatura: ");
        Serial.print(tempC1);
        Serial.println(" °C");
    } else {
        Serial.println("Error: Sensor 1 desconectado");
    }

    float tempC2 = sensors.getTempCByIndex(1);
    
    if (tempC2 != DEVICE_DISCONNECTED_C) {
        Serial.print("Sensor 2 Temperatura: ");
        Serial.print(tempC2);
        Serial.println(" °C");
    } else {
        Serial.println("Error: Sensor 2 desconectado");
    }

    if (tempC1 == DEVICE_DISCONNECTED_C && tempC2 == DEVICE_DISCONNECTED_C) {
        return DEVICE_DISCONNECTED_C;
    } else if (tempC1 == DEVICE_DISCONNECTED_C) {
        return tempC2;
    } else if (tempC2 == DEVICE_DISCONNECTED_C) {
        return tempC1;
    } else {
        return (tempC1 + tempC2) / 2.0;
    }
}
