/**
 * API de login de admin simple
 */

export const config = {
  runtime: 'nodejs',
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { token } = req.body;
    
    console.log('Login attempt - Token recibido:', token ? 'SI' : 'NO');
    console.log('ADMIN_TOKEN configurado:', process.env.ADMIN_TOKEN ? 'SI' : 'NO');
    
    if (!token) {
      return res.status(400).json({ error: 'Token requerido' });
    }

    // Verificar token de admin
    const adminToken = process.env.ADMIN_TOKEN;
    
    if (!adminToken) {
      console.error('ERROR: ADMIN_TOKEN no está configurado en las variables de entorno');
      return res.status(500).json({ error: 'ADMIN_TOKEN no configurado en el servidor' });
    }
    
    if (token === adminToken) {
      console.log('Login exitoso');
      // Configurar cookie de admin
      res.setHeader('Set-Cookie', 'admin=1; HttpOnly; Secure; SameSite=Lax; Max-Age=86400');
      
      return res.status(200).json({ 
        success: true, 
        message: 'Login exitoso' 
      });
    } else {
      console.log('Token inválido - No coincide');
      return res.status(401).json({ error: 'Token inválido' });
    }

  } catch (error) {
    console.error('Error en admin login:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
