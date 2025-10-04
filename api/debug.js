/**
 * API de diagnóstico para verificar configuración
 */

export const config = {
  runtime: 'nodejs',
};

export default async function handler(req, res) {
  try {
    const debug = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      variables: {
        USE_UPSTASH: process.env.USE_UPSTASH,
        HAS_UPSTASH_URL: !!process.env.UPSTASH_REDIS_REST_URL,
        HAS_UPSTASH_TOKEN: !!process.env.UPSTASH_REDIS_REST_TOKEN,
        HAS_ADMIN_TOKEN: !!process.env.ADMIN_TOKEN,
        HAS_TURNSTILE_SITE: !!process.env.TURNSTILE_SITE_KEY,
        HAS_TURNSTILE_SECRET: !!process.env.TURNSTILE_SECRET_KEY,
        HAS_KV_URL: !!process.env.KV_REST_API_URL,
        HAS_KV_TOKEN: !!process.env.KV_REST_API_TOKEN
      },
      upstash_url: process.env.UPSTASH_REDIS_REST_URL ? 'Set' : 'Not set',
      kv_url: process.env.KV_REST_API_URL ? 'Set' : 'Not set'
    };

    return res.status(200).json(debug);
    
  } catch (error) {
    return res.status(500).json({ 
      error: error.message,
      stack: error.stack
    });
  }
}
