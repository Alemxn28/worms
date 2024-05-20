// Declaración de dependencias
const mqtt = require('mqtt');
const mysql = require('mysql');
const express = require('express');
const session = require('express-session');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const cors = require('cors'); 
let currentUser = 'worms@gmail.com';
let currentPassword = '1234';

// Crear una aplicación Express y configurar el servidor HTTP y WebSocket
const app = express();
// Configurar CORS
app.use(cors({
  origin: "http://localhost:3001", // Reemplazar con el origen correcto de tu front-end
  methods: ["GET", "POST"],
  credentials: true
}));
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3001", // Reemplazar con el origen correcto de tu front-end
    methods: ["GET", "POST"]
  }
});


app.use(express.static(path.join(__dirname, '../../worms-react/worms-app/build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../worms-react/worms-app/build', 'index.html'));
});

// Configuración de sesión
app.use(session({
  secret: 'salsa2023',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Ajustar a true si usas HTTPS
}));

// Middleware para servir archivos estáticos y parsear cuerpos de request
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conexión a la base de datos
const db = mysql.createConnection({
    host: "localhost",
    user: 'root',
    password: 'password',
    database: 'mqqtnode'
});

db.connect(err => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err);
        throw err;
    }
    console.log('Conexión a la base de datos establecida.');
}); 

// Conexión al servidor MQTT
const sub = mqtt.connect('mqtt://localhost:9000');

// Subscripción a tópicos
sub.on('connect', () => {
    sub.subscribe('humedad');
    sub.subscribe('temperatura');
    sub.subscribe('ph');
});

// Recepción de mensaje y inserción a la BD
sub.on('message', (topic, message) => {
    const messageString = message.toString();
    console.log('Mensaje recibido en el tópico', topic, ':', messageString);

    if (topic === 'temperatura') {
        const floatValue = parseFloat(messageString);
        if (!isNaN(floatValue)) {
            const sql = 'INSERT INTO temperatura (DATA) VALUES (?)';
            db.query(sql, [floatValue], (error, results) => {
                if (error) {
                    console.error('Error al insertar en tabla1:', error);
                } else {
                    console.log('Valor insertado en tabla1:', floatValue);
                    io.emit('temperatura1', { value: floatValue }); // Emitir los datos al frontend
                }
            });
        }
    } else if (topic === 'humedad') {
        const data = parseInt(messageString, 10);
        if (!isNaN(data)) {
            const sql = 'INSERT INTO humedad1 SET ?';
            const values = { data: data };
            db.query(sql, values, (error, results) => {
                if (error) {
                    console.error('Error al insertar en la base de datos:', error);
                } else {
                    console.log('¡Datos guardados!');
                    io.emit('humedad1', { value: data }); // Emitir los datos al frontend
                }
            });
        }
    } else if (topic === 'ph') {
      const data = parseInt(messageString, 10);
      if (!isNaN(data)) {
          const sql = 'INSERT INTO ph SET ?';
          const values = { data: data };
          db.query(sql, values, (error, results) => {
              if (error) {
                  console.error('Error al insertar en la base de datos:', error);
              } else {
                  console.log('¡Datos guardados!');
                  io.emit('ph1', { value: data }); // Emitir los datos al frontend
              }
          });
      }
  }
});

// Rutas HTTP


app.get('/login', (req,res) => {
  res.redirect('/login');
  });

app.get('/null', (req, res) => {
  if (req.session.user) {
    let ruta = req.session.route || 'sensores'; // Proporciona una ruta por defecto si no hay ninguna guardada.
    res.redirect('/' + ruta);
  } else {
    res.redirect('/login');
  }
});

app.get('/', (req,res) => {
  if (req.session.user) {
    res.redirect('/sensores');
  } else {
    res.redirect('/login');
  }
});

app.post('/updateCredentials', (req, res) => {
  const { newUsername, newPassword } = req.body;
  // Actualiza las credenciales globales
  currentUser = newUsername;
  currentPassword = newPassword;
  // Puedes agregar aquí validaciones adicionales si es necesario
  res.json({ status: 'ok', message: 'Credenciales actualizadas' });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === currentUser && password === currentPassword) {
    req.session.user = username;
    res.json({ status: 'ok'}); // Envía JSON con URL de redirección
  } else {
    res.status(401).json({ status: 'error', message: 'Usuario y/o contraseña incorrectos' });
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy(err => {
      if (err) {
          console.error(err);
          res.send("Error al cerrar sesión");
      } else {
          res.redirect('/login');
      }
  });
});

app.get('/actuadores', (req, res) => {
  if (req.session.user) {
    res.sendFile('Actuadores.html', { root: __dirname });
  } else {
    res.redirect('/login');

    const { status } = req.body; // status puede ser 'ON' o 'OFF'
    mqttClient.publish('actuador/relevador', status);
    res.json({ message: 'Comando enviado al relevador.' });
  }
});

app.get('/administrador', (req, res) => {
  if (req.session.user) {
    res.sendFile('Administrador.html', { root: __dirname });
  } else {
    res.redirect('/login');
  }
});

app.get('/registros', (req, res) => {
  if (req.session.user) {
    res.redirect('/registros');
  } else {
    res.redirect('/login');
  }
});

app.get('/checkAuth', (req, res) => {
  if (req.session.user) {
    res.json({ isAuthenticated: true });
  } else {
    res.json({ isAuthenticated: false });
  }
});




// Inicia el servidor
server.listen(3000, () => {
    console.log('Servidor web y WebSocket corriendo en http://localhost:3000');
});

// Cerrar la conexión a la base de datos cuando ya no se necesite
process.on('SIGINT', () => {
    console.log('Cerrando conexión a la base de datos...');
    db.end(err => {
        if (err) {
            console.error('Error al cerrar conexión a la base de datos:', err);
        } else {
            console.log('Conexión a la base de datos cerrada.');
        }
        process.exit();
    });
});

app.use(express.static('path_to_your_react_build_directory'));

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'path_to_your_react_build_directory', 'index.html'));
});
