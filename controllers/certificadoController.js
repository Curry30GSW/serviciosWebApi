const certificadoModel = require('../models/certificadoModel');

const certificadoController = {
  async mostrarCertificados(req, res) {
    try {
      const { libreria, cuenta } = req.params; // Obtener librería y cuenta de los parámetros de la ruta
      if (!libreria || !cuenta) {
        return res.status(400).json({ error: 'La librería y la cuenta son requeridas.' });
      }

      const certificados = await certificadoModel.getCertificadoData(libreria, cuenta);

      if (certificados.length === 0) {
        return res.status(404).json({ message: 'No se encontraron datos para los criterios proporcionados.' });
      }

      res.status(200).json(certificados);
    } catch (error) {
      console.error('Error al mostrar certificados:', error.message);
      res.status(500).json({ error: 'Error al obtener los datos del certificado.' });
    }
  },
};

module.exports = certificadoController;
