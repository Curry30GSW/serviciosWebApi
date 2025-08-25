const express = require('express');
const session = require('express-session');
const dotenv = require('dotenv');
const cors = require('cors');
const { connectToDatabase } = require('./config/db');
const errorHandler = require('./middlewares/errorHandler');
const cuentaF6Routes = require('./routes/cuentaF6Routes');
const certificadoRentaRoutes = require('./routes/certificadoRentaRoutes');
const cuentasRoutes = require('./routes/cuentaSltRoutes');
const authRoutes = require("./middlewares/authRoutes");
const userRoutes = require("./routes/userRoutes")
const bodyParser = require('body-parser');
const auditoriaRoutes = require('./routes/auditoriaRoutes');




dotenv.config();


// Configuración de Express
const app = express();

app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

// Habilitar CORS para permitir solicitudes desde el frontend
app.use(cors({
  origin: ["http://127.0.0.1:5500", "http://localhost:5500", "http://127.0.0.1:5501"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));


app.use(express.urlencoded({ extended: true }));

// Middleware para parsear JSON
app.use(express.json());

// Ruta raíz para verificar que la API está funcionando
app.get('/', (req, res) => {
  res.send('API running');
});


// Ruta para estado de cuenta
app.use('/api', cuentaF6Routes);

// Rutas
app.use('/api/auth', authRoutes);


// Ruta Registro y Olvidar PSSW
app.use('/api', userRoutes)

app.use('/api', certificadoRentaRoutes);

// Ruta SELECT CUENTAS
app.use('/api', cuentasRoutes);

app.use('/api', auditoriaRoutes);

app.use(bodyParser.json());

// Middleware de manejo de errores
app.use(errorHandler);

// Configuración del servidor
const PORT = process.env.PORT || 5000;

// Validar conexión a la base de datos y arrancar el servidor
const startServer = async () => {
  try {
    await connectToDatabase(); // Valida la conexión antes de iniciar el servidor
    app.listen(PORT, () => {
      console.log(`Servidor iniciado en http://localhost:${PORT}`);
      console.log(`Base de datos MYSQL En LiNEA`);
    });
  } catch (error) {
    console.error('No se pudo conectar a la base de datos. Verifica tu configuración.');
    process.exit(1); // Finaliza el proceso si hay un error
  }
};

startServer();