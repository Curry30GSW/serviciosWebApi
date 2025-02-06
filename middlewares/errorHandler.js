const errorHandler = (err, req, res, next) => {
    console.error(`[ERROR]: ${err.message}`); // Loguear el error en consola para debugging
  
    // Si no se ha definido el código de estado, usar 500 (Internal Server Error)
    const statusCode = err.statusCode || 500;
  
    // Respuesta de error estandarizada
    res.status(statusCode).json({
      success: false,
      error: {
        message: err.message || 'Ocurrió un error en el servidor',
      },
    });
  };
  
  module.exports = errorHandler;
  