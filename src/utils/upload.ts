import { supabase } from '../lib/supabase';
import imageCompression from 'browser-image-compression';

export const uploadImage = async (file: File, bucket: string = 'images'): Promise<string | null> => {
  try {
    // Comprime a imagem antes do upload (WebP, max 800px, max 100KB)
    const options = {
      maxSizeMB: 0.1, // ~100KB
      maxWidthOrHeight: 800,
      useWebWorker: true,
      fileType: 'image/webp'
    };
    
    let compressedFile: File | Blob = file;
    // Evita tentar comprimir arquivos que não são imagens suportadas
    if (file.type.startsWith('image/') && file.type !== 'image/svg+xml') {
      try {
        compressedFile = await imageCompression(file, options);
      } catch (err) {
        console.warn('Falha ao comprimir imagem. Enviando original.', err);
      }
    }

    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.webp`;
    const filePath = `${fileName}`;

    // Cache-Control de 1 ano (31536000)
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, compressedFile, {
        cacheControl: '31536000',
        upsert: false
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return data.publicUrl;
  } catch (error: any) {
    console.error('Error uploading image:', error);
    throw new Error(`Falha no upload da imagem: ${error.message}`);
  }
};
