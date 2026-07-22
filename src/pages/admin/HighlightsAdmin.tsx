import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { uploadImage } from '../../utils/upload';
import { Save } from 'lucide-react';

const HIGHLIGHT_BANNER_TITLE = '__DESTAQUE_PRINCIPAL__';

export const HighlightsAdmin: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bannerId, setBannerId] = useState<string | null>(null);

  const [title, setTitle] = useState('TEM JOGO PRA TODO BOLSO');
  const [subtitle, setSubtitle] = useState('Escolha quanto quer gastar e a gente mostra os melhores títulos naquela faixa.');
  const [tagText, setTagText] = useState('% COMPRE POR FAIXA DE PREÇO');
  const [link, setLink] = useState('');
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchHighlightBanner();
  }, []);

  const fetchHighlightBanner = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .eq('title', HIGHLIGHT_BANNER_TITLE)
        .limit(1)
        .single();
        
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      if (data) {
        setBannerId(data.id);
        
        // Em subtitle armazenaremos um JSON com os textos auxiliares para não criar nova tabela
        try {
          const parsedData = JSON.parse(data.subtitle || '{}');
          setTitle(parsedData.title || 'TEM JOGO PRA TODO BOLSO');
          setSubtitle(parsedData.subtitle || 'Escolha quanto quer gastar e a gente mostra os melhores títulos naquela faixa.');
          setTagText(parsedData.tagText || '% COMPRE POR FAIXA DE PREÇO');
        } catch (e) {
          // Se não for JSON (migração legada), apenas ignora e usa defaults
        }
        
        setLink(data.link || '');
        setCurrentImageUrl(data.image);
      }
    } catch (error) {
      console.error('Error fetching highlight banner:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!imageFile && !currentImageUrl) {
      alert("É obrigatório selecionar uma imagem para o destaque.");
      return;
    }
    
    setSaving(true);

    try {
      let finalImageUrl = currentImageUrl;

      if (imageFile) {
        const uploadedUrl = await uploadImage(imageFile);
        if (uploadedUrl) finalImageUrl = uploadedUrl;
      }

      // Compacta as configurações textuais no campo subtitle como JSON
      const configData = JSON.stringify({
        title,
        subtitle,
        tagText
      });

      const bannerData = {
        title: HIGHLIGHT_BANNER_TITLE,
        subtitle: configData,
        link,
        image: finalImageUrl,
        order_grid: 9999, // Mantém num índice alto
        is_active: true
      };

      if (bannerId) {
        const { error } = await supabase.from('banners').update(bannerData).eq('id', bannerId);
        if (error) throw error;
        await supabase.from('activity_logs').insert([{ action: 'updated_highlight', entity_type: 'banner', entity_id: bannerId }]);
      } else {
        const { data, error } = await supabase.from('banners').insert([bannerData]).select().single();
        if (error) throw error;
        setBannerId(data.id);
        await supabase.from('activity_logs').insert([{ action: 'created_highlight', entity_type: 'banner', entity_id: data.id }]);
      }

      alert('Seção de destaques salva com sucesso!');
      await fetchHighlightBanner();
    } catch (error: any) {
      alert(`Erro: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Seção de Destaques</h1>
          <p className="text-slate-500 mt-1">Configure o banner e os textos exibidos abaixo da seção "Sobre Nós".</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
          
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-4 border-b pb-2">Imagem Principal e Link</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Imagem Promocional (Banner)</label>
                <div className="space-y-3">
                  {currentImageUrl && !imageFile && (
                    <div className="relative w-full md:w-2/3 h-48 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                      <img src={currentImageUrl} alt="Destaque" className="w-full h-full object-cover" />
                    </div>
                  )}
                  {imageFile && (
                    <div className="w-full md:w-2/3 h-48 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center border border-blue-200 font-medium">
                      Nova imagem selecionada
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        setImageFile(e.target.files[0]);
                      }
                    }}
                    className="w-full max-w-md text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Link de Redirecionamento</label>
                <input
                  type="text"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="Ex: /categoria/promocoes"
                  className="w-full max-w-2xl px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-slate-500 mt-1">Para onde o usuário será levado ao clicar no banner.</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-4 border-b pb-2">Textos da Seção</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Tag Superior (Verde)</label>
                <input
                  type="text"
                  value={tagText}
                  onChange={(e) => setTagText(e.target.value)}
                  className="w-full max-w-md px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Título Grande</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full max-w-2xl px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                />
              </div>
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Subtítulo Explicativo</label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full max-w-2xl px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-200">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Save size={20} />
              )}
              {saving ? 'Salvando...' : 'Salvar Destaque'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
