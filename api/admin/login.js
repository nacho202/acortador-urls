/**
 * API de login de administrador
 */

export const config = {
  runtime: 'nodejs',
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { token, turnstileToken } = req.body;

    // Validar token de administrador
    if (token !== process.env.ADMIN_TOKEN) {
      return res.status(401).json({ error: 'Token de administrador inválido' });
    }

    // Validar Turnstile captcha
    if (!turnstileToken) {
      return res.status(400).json({ error: 'Token de Turnstile requerido' });
    }

    // Verificar captcha con Cloudflare
    const turnstileResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: process.env.TURNSTILE_SECRET_KEY,
        response: turnstileToken,
        remoteip: req.headers['x-forwarded-for'] || req.connection.remoteAddress
      })
    });

    const turnstileResult = await turnstileResponse.json();

    if (!turnstileResult.success) {
      return res.status(400).json({ 
        error: 'Captcha inválido',
        details: turnstileResult['error-codes']
      });
    }

    // Establecer cookie de administrador
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 1000 // 1 hora
    };

    res.setHeader('Set-Cookie', `admin=1; ${Object.entries(cookieOptions)
      .map(([key, value]) => `${key}=${value}`)
      .join('; ')}`);

    return res.status(200).json({ 
      message: 'Login exitoso',
      admin: true
    });

  } catch (error) {
    console.error('Error en login de admin:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
