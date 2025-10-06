/**
 * API de sesión que funciona
 */

export const config = {
  runtime: 'nodejs',
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Generar un SID simple
    const sid = Math.random().toString(36).substring(2, 15);
    
    // Configurar cookie
    res.setHeader('Set-Cookie', `sid=${sid}; HttpOnly; Secure; SameSite=Lax; Max-Age=604800`);

    return res.status(200).json({ ok: true, sid });
    
  } catch (error) {
    console.error('Error en session API:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
