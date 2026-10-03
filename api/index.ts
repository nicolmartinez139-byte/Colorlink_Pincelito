import app from '../server';

// Serverless function handler principal / fallback para Vercel
export default function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Si Vercel reescribió la URL, recuperar la ruta original desde headers
  const matched = req.headers['x-matched-path'] || req.headers['x-forwarded-url'] || req.headers['x-now-route-matches'];
  if (matched && typeof matched === 'string' && matched.startsWith('/api')) {
    req.url = matched;
  }

  return app(req, res);
}
