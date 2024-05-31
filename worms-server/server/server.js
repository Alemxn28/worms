// Declaración de dependencias
const mqtt = require('mqtt');
const mysql = require('mysql');
const express = require('express');
const session = require('express-session');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const cors = require('cors');

// Crear una aplicación Express y configurar el servidor HTTP y WebSocket
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", // Puedes especificar más restricciones aquí
    methods: ["GET", "POST"]
  }
});

// Configuración de CORS
app.use(cors({
  origin: "http://localhost:3001", // Permite solicitudes desde el cliente en desarrollo
  credentials: true
}));

// Configuración de sesión
app.use(session({
  secret: 'salsa2023',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Ajustar a true si usas HTTPS
}));

// Middlewares para servir archivos estáticos y parsear cuerpos de request
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
const pub = mqtt.connect('mqtt://localhost:9000');

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

// Endpoint para registrar nuevos usuarios
app.post('/register', (req, res) => {
  const { username, password } = req.body;

  // Validar que los campos no estén vacíos
  if (!username || !password) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
  }

  // Insertar nuevo usuario con rol 'user' en la base de datos
  const sql = 'INSERT INTO usuarios (correo, contraseña, rol) VALUES (?, ?, ?)';
  const values = [username, password, 'user'];

  db.query(sql, values, (err, results) => {
    if (err) {
      console.error('Error al insertar nuevo usuario:', err);
      return res.status(500).json({ message: 'Error al registrar el usuario.' });
    }

    res.json({ message: 'Usuario registrado con éxito.' });
  });
});

// Endpoint para manejar el login
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  const sql = 'SELECT * FROM usuarios WHERE correo = ? AND contraseña = ?';
  const values = [username, password];

  db.query(sql, values, (err, results) => {
    if (err) {
      console.error('Error al verificar las credenciales:', err);
      return res.status(500).json({ message: 'Error al verificar las credenciales.' });
    }

    if (results.length > 0) {
      const user = results[0];
      req.session.user = username;
      res.json({ status: 'ok', role: user.rol });
    } else {
      res.status(401).json({ status: 'error', message: 'Usuario y/o contraseña incorrectos' });
    }
  });
});

app.post('/actuadores', (req, res) => {
  const { name, status } = req.body;
  let topic = '';
  if (name === 'Ventilador') {
    topic = 'actuador/ventilador';
  } else if (name === 'Sistema de Riego') {
    topic = 'actuador/bombaDeAgua';
  }
  pub.publish(topic, status);
  res.json({ message: `Comando ${status} enviado al ${name}.` });
});

app.post('/modo', (req, res) => {
  const { status } = req.body;
  pub.publish('modo/automatico', status);
  res.json({ message: `Modo automático ${status}` });
});

app.get('/api/data/:timeframe', (req, res) => {
  const timeframe = req.params.timeframe;
  const today = new Date();
  let dateLimit;
  console.log("Accedido a la ruta con timeframe:", req.params.timeframe);
  switch (timeframe) {
    case 'dia':
      dateLimit = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
      break;
    case 'semana':
      dateLimit = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
      break;
    case 'mes':
      dateLimit = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
      break;
    default:
      return res.status(400).json({ error: 'Parámetro de tiempo no válido' });
  }

  const dateString = `${dateLimit.getFullYear()}-${('0' + (dateLimit.getMonth() + 1)).slice(-2)}-${('0' + dateLimit.getDate()).slice(-2)}`;
  const queries = [
    `SELECT * FROM humedad1 WHERE created_at >= '${dateString}'`,
    `SELECT * FROM ph WHERE created_at >= '${dateString}'`,
    `SELECT * FROM temperatura WHERE created_at >= '${dateString}'`
  ];

  Promise.all(queries.map(query => new Promise((resolve, reject) => {
    db.query(query, (err, data) => {
      if (err) {
        reject(err);
      } else {
        if (data.length === 0) {
          reject(new Error('No existen datos tan viejos'));
        } else {
          resolve(data);
        }
      }
    });
  })))
  .then(results => {
    res.json({
      humedad: results[0],
      ph: results[1],
      temperatura: results[2]
    });
  })
  .catch(error => {
    res.status(500).json({ error: error.message });
  });
});


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

// Servir archivos estáticos de React en producción
if ( 'production' === 'production') {
  app.use(express.static(path.join(__dirname, '../../worms-react/worms-app/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../worms-react/worms-app/build', 'index.html'));
  });
}

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
      process.exit();
    }
  });
});
