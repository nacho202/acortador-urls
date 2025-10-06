/**
 * API de prueba simple
 */

export const config = {
  runtime: 'nodejs',
};

export default async function handler(req, res) {
  try {
    return res.status(200).json({ 
      message: 'API simple funcionando',
      timestamp: new Date().toISOString(),
      method: req.method
    });
  } catch (error) {
    return res.status(500).json({ 
      error: error.message,
      stack: error.stack
    });
  }
}
