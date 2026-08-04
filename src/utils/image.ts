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
  if (url.includes('supabase.co')) {
    // Se a URL já possui parâmetros de query, usamos '&', senão '?'
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}width=${width}&format=avif&quality=65`;
  }

  // Fallback para Weserv caso não seja Supabase (avif suportado)
  const cleanUrl = url.replace(/^https?:\/\//, '');
  return `https://wsrv.nl/?url=${encodeURIComponent(cleanUrl)}&w=${width}&output=avif&q=65`;
}
