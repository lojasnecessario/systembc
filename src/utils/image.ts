export function getOptimizedImageUrl(url: string | null, width = 500): string | null {
  if (!url) return null;
  
  // Se for uma imagem local, base64 ou já otimizada, não fazemos nada
  if (
    url.startsWith('/') || 
    url.startsWith('data:') || 
    url.includes('wsrv.nl')
  ) {
    return url;
  }
  
  // Usamos o serviço gratuito Weserv.nl para buscar a imagem original (ex: do Supabase)
  // e retornar uma versão comprimida em WebP e redimensionada
  const cleanUrl = url.replace(/^https?:\/\//, '');
  return `https://wsrv.nl/?url=${encodeURIComponent(cleanUrl)}&w=${width}&output=webp&q=80`;
}
