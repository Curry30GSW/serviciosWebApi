const express = require('express');
const session = require('express-session');
const dotenv = require('dotenv');
const cors = require('cors');
const { connectToDatabase } = require('./config/db');
const errorHandler = require('./middlewares/errorHandler');
const certificadoRoutes = require('./routes/certificadoRoutes');
const creditosRoutes = require('./routes/interesesVenRoutes');
const interesesPagRoutes = require('./routes/interesesPagRoutes');
const creditosViviRoutes = require('./routes/creditosViviRoutes');
const creditosOtrosRoutes = require('./routes/creditosOtrosRoutes');
const creditosCapRoutes = require('./routes/creditosCapRoutes');
const otrosIngresosRoutes = require('./routes/otrosIngresosRoutes');
const fondoSoliRoutes = require('./routes/fondoSoliRoutes');
const unifiedRoutes = require('./routes/unifiedRoutes')
const cuentaF6Routes = require('./routes/cuentaF6Routes');
const cuentasRoutes = require('./routes/cuentaSltRoutes');
const authRoutes = require("./middlewares/authRoutes");
const userRoutes = require("./routes/userRoutes")
const bodyParser = require('body-parser');





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
  origin: "http://127.0.0.1:5500", // Especifica el origen permitido
  methods: ["GET", "POST", "PUT", "DELETE"], // Métodos HTTP permitidos
  allowedHeaders: ["Content-Type", "Authorization"] // Headers permitidos
}));


app.use(express.urlencoded({ extended: true }));

// Middleware para parsear JSON
app.use(express.json());

// Ruta raíz para verificar que la API está funcionando
app.get('/', (req, res) => {
  res.send('API running');
});

// Rutas de certificados
app.use('/api', certificadoRoutes);

// Rutas de créditos capital
app.use('/api', creditosCapRoutes);

// Rutas de intereses CORRIENTE Y MORA
app.use('/api', creditosRoutes);

// Rutas de Intereses Pagados por año
app.use('/api', interesesPagRoutes);

// Rutas creditos de vivienda y otros
app.use('/api', creditosViviRoutes);
app.use('/api', creditosOtrosRoutes);

// Rutas revalorización de aportes
app.use('/api', otrosIngresosRoutes);

// Ruta fondo solidaridad
app.use('/api', fondoSoliRoutes);

// Ruta Unificadas
app.use('/api', unifiedRoutes)

// Ruta para estado de cuenta
app.use('/api', cuentaF6Routes);

// Rutas
app.use('/api', authRoutes);

// Ruta SELECT CUENTAS
app.use('/api', cuentasRoutes);

// Ruta Registro y Olvidar PSSW
app.use('/api', userRoutes)

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
    });
  } catch (error) {
    console.error('No se pudo conectar a la base de datos. Verifica tu configuración.');
    process.exit(1); // Finaliza el proceso si hay un error
  }
};

startServer();