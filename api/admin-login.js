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
    
    if (!token) {
      return res.status(400).json({ error: 'Token requerido' });
    }

    // Verificar token de admin
    if (token === process.env.ADMIN_TOKEN) {
      // Configurar cookie de admin
      res.setHeader('Set-Cookie', 'admin=1; HttpOnly; Secure; SameSite=Lax; Max-Age=86400');
      
      return res.status(200).json({ 
        success: true, 
        message: 'Login exitoso' 
      });
    } else {
      return res.status(401).json({ error: 'Token inválido' });
    }

  } catch (error) {
    console.error('Error en admin login:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
