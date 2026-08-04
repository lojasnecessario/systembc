export const getOptimizedImageUrl = (url: string | null | undefined, width: number = 400): string => {
  if (!url) return '';
  
  if (url.includes('supabase.co')) {
    const cleanUrl = url.split('?')[0];
    const ext = cleanUrl.split('.').pop()?.toLowerCase();
    
    // Se a imagem já foi enviada no formato correto via nossa nova pipeline de upload (webp/avif)
    // nós apenas retornamos ela limpa, pois ela já está comprimida no Supabase e em Cache longo.
    if (ext === 'webp' || ext === 'avif') {
      return cleanUrl;
    }
    
    // Se for uma imagem antiga, crua, em PNG/JPG, passamos pelo proxy gratuito (wsrv.nl)
    // Isso conserta retroativamente os 10MB das imagens antigas sem precisar re-uploadar
    return `https://wsrv.nl/?url=${encodeURIComponent(cleanUrl)}&w=${width}&output=webp&q=70`;
  }
  
  return url;
};
