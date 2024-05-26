#include <WiFi.h>
#include <PubSubClient.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <WiFiManager.h>

// Definir el pin para los sensores OneWire
#define ONE_WIRE_BUS 15
const int sensorPin = 34; // Pin para el sensor de humedad
const int sensorPin2 = 35; // Otro pin para el segundo sensor de humedad
const int relePin1 = 5;    // Ventilador
const int relePin2 = 4;    // Agua
const int analogInPin = 36;  // GPIO 32 para entrada ADC
const int sensorPin3 = 13; // sensor de nivel de agua 

float slope = -6.81;  
float intercept = 23.87;  

const int numReadings = 10;
int readings1[numReadings]; 
int readings2[numReadings];
int readIndex1 = 0;         
int readIndex2 = 0;
int total1 = 0;             
int total2 = 0;
int average1 = 0;
int average2 = 0;

unsigned long lastPumpStartTime = 0;
unsigned long pumpRunTime = 0;
const unsigned long pumpInterval = 60000; // 10 minutos en milisegundos
const unsigned long maxPumpTime = 50000; // 50 segundos acumulados

unsigned long fanStartTime = 0;
const unsigned long fanRunTime = 18000; // 30 minutos en milisegundos
unsigned long lastFanOffTime = 0; // Tiempo cuando el ventilador fue apagado por última vez
const unsigned long fanOffInterval = 12000; // 20 minutos en milisegundos
bool fanRunning = false;

OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

const char* mqttServer = "192.168.205.38";
const int mqttPort = 9000;
const char* mqttUser = "";
const char* mqttPassword = "";

WiFiClient espClient;
PubSubClient client(espClient);

void setup() {
    Serial.begin(9600);
    WiFiManager wifiManager;
      //wifiManager.resetSettings();
    
    if (!wifiManager.autoConnect("ESP32AP")) {
        Serial.println("Fallo en la conexión");
        ESP.restart();
    }

    Serial.println("Conectado a la red WiFi.");
    pinMode(analogInPin,INPUT);
    pinMode(relePin1, OUTPUT);
    pinMode(relePin2, OUTPUT);
    digitalWrite(relePin1, LOW);
    digitalWrite(relePin2, LOW);

    client.setServer(mqttServer, mqttPort);
    while (!client.connected()) {
        Serial.println("Connecting to MQTT...");
        if (client.connect("ESP32Client", mqttUser, mqttPassword)) {
            Serial.println("Connected");
        } else {
            Serial.print("Failed with state ");
            Serial.print(client.state());
            delay(2000);
        }
    }
    for (int thisReading = 0; thisReading < numReadings; thisReading++) {
        readings1[thisReading] = 0;
        readings2[thisReading] = 0;
    }

    sensors.begin();
    analogReadResolution(12); 
}

void loop() {
    sensors.requestTemperatures();
    float promedioTemp = leerYPromediarTemperaturas();
    int nivel = digitalRead(analogInPin);
    Serial.print(nivel);
    Serial.println(" MEDIDA DE NIVEL DE Agua: ");
    char tempString[20];
    dtostrf(promedioTemp, 1, 2, tempString);
     Serial.print(" Temperatura Promedio: ");
        Serial.print(tempString);
        Serial.println(" °C");
    client.publish("temperatura", tempString);

    average1 = leerYSuavizarHumedad(sensorPin, readings1, readIndex1, total1);
    average2 = leerYSuavizarHumedad(sensorPin2, readings2, readIndex2, total2);

    readIndex1 = (readIndex1 + 1) % numReadings;
    readIndex2 = (readIndex2 + 1) % numReadings;

    // Promedio de las dos lecturas de humedad
    float promedioHumedad = (average1 + average2) / 2.0;

    char humedadString1[8];
    char humedadString2[8];
    char promedioHumedadString[8];
    
    sprintf(humedadString1, "%d", average1);
    sprintf(humedadString2, "%d", average2);
    dtostrf(promedioHumedad, 1, 2, promedioHumedadString);

    // Imprimir valores promediados y crudos en el Serial Monitor
    Serial.print("Valor de humedad promediado sensor 1: ");
    Serial.println(humedadString1);
    Serial.print("Valor de humedad promediado sensor 2: ");
    Serial.println(humedadString2);
    Serial.print("Valor de humedad promediado de ambos sensores: ");
    Serial.println(promedioHumedadString);
    client.publish("humedad",promedioHumedadString );


// Convertir a double
double temp = atof(tempString);
double humedadPromedio = atof(promedioHumedadString);

unsigned long currentMillis = millis();
    Serial.print("Current Millis: ");
    Serial.println(currentMillis);
    Serial.print("Last Fan Off Time: ");
    Serial.println(lastFanOffTime);
    Serial.print("Fan Off Interval: ");
    Serial.println(fanOffInterval);

// Control del relé basado en condiciones
if (temp > 25.0 && humedadPromedio < 70.0) {
  
    digitalWrite(relePin1, HIGH); // Encender relé 1
    digitalWrite(relePin2, HIGH); // Encender relé 2
    Serial.println("Actuadores encendidos (Temp > 25°C, Hum < 70%)");
} else if (temp > 25.0 && humedadPromedio >= 70.0 && humedadPromedio <= 80.0) {
    digitalWrite(relePin1, HIGH); // Encender solo relé 1
    digitalWrite(relePin2, LOW); // Apagar relé 2
    Serial.println("Ventilador encendido, Bomba apagada (Temp > 25°C, Hum 70%-80%)");
} else if (temp <= 25.0 && humedadPromedio < 70.0) {
    digitalWrite(relePin1, LOW); // Apagar relé 1
    digitalWrite(relePin2, HIGH); // Encender relé 2
    Serial.println("Ventilador apagado, Bomba encendida (Temp <= 25°C, Hum < 70%)");
} else {
    digitalWrite(relePin1, LOW); // Apagar ambos relés por defecto
    digitalWrite(relePin2, LOW);
    Serial.println("Ambos relés apagados (Condición por defecto)");
}

    int adcValue = analogRead(analogInPin);
    float voltage = adcValue * (3.3 / 4095.0);
    float pHValue = (voltage * slope) + intercept;




    char phString[20];
    dtostrf(pHValue, 1, 2, phString);
    Serial.print("Valor ADC: ");
    Serial.print(adcValue);
    Serial.print(", Voltaje: ");
    Serial.print(voltage, 2);
    Serial.print(" V, pH: ");
    Serial.println(pHValue, 2);
    client.publish("ph", phString);

    delay(1000);
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
