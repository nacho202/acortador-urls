/**
 * API de sesión - Garantiza cookie sid para usuarios
 */

const { nanoid } = require('nanoid');

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Verificar si ya existe cookie sid
    const existingSid = req.cookies.sid;
    
    if (existingSid) {
      return res.status(200).json({ ok: true, sid: existingSid });
    }

    // Generar nuevo SID
    const sid = nanoid(16);
    
    // Configurar cookie HttpOnly, Secure, SameSite
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
    };

    res.setHeader('Set-Cookie', `sid=${sid}; ${Object.entries(cookieOptions)
      .map(([key, value]) => `${key}=${value}`)
      .join('; ')}`);

    return res.status(200).json({ ok: true, sid });
    
  } catch (error) {
    console.error('Error en session API:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
