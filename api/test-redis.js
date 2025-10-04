/**
 * API de prueba para verificar conexión con Redis
 */

const store = require('../src/lib/store');

export const config = {
  runtime: 'nodejs',
};

export default async function handler(req, res) {
  try {
    console.log('Testing Redis connection...');
    
    // Probar conexión básica
    await store.set('test:connection', 'ok', 60);
    const result = await store.get('test:connection');
    
    if (result === 'ok') {
      console.log('Redis connection successful');
      return res.status(200).json({ 
        status: 'success', 
        message: 'Redis connection working',
        result: result
      });
    } else {
      console.log('Redis connection failed - unexpected result');
      return res.status(500).json({ 
        status: 'error', 
        message: 'Redis connection failed - unexpected result',
        result: result
      });
    }
    
  } catch (error) {
    console.error('Redis connection error:', error);
    return res.status(500).json({ 
      status: 'error', 
      message: 'Redis connection failed',
      error: error.message,
      stack: error.stack
    });
  }
}
